const EventEmitter = require("events");
const { Client, LocalAuth } = require("whatsapp-web.js");

const events = new EventEmitter();

let client = null;
let initializing = false;
let ready = false;
let reconnectAttempts = 0;
let reconnectTimer = null;
let lastStateWarningAt = 0;

const maxReconnectDelayMs = 60 * 1000;
const stateWarningIntervalMs = 30 * 1000;

const isTransientPuppeteerError = (error) => {
  const message = String(error?.message || error);

  return (
    message.includes("detached Frame") ||
    message.includes("Execution context was destroyed") ||
    message.includes("Protocol error")
  );
};

const createNotReadyError = () => {
  const error = new Error("WhatsApp client is not ready");
  error.statusCode = 503;
  return error;
};

const createClient = () => {
  const nextClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: process.env.WWEBJS_AUTH_PATH || ".wwebjs_auth",
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-zygote",
      ],
    },
  });

  nextClient.on("qr", (qr) => {
    ready = false;
    events.emit("qr", qr);
  });

  nextClient.on("authenticated", () => {
    events.emit("authenticated");
  });

  nextClient.on("auth_failure", (message) => {
    ready = false;
    events.emit("auth_failure", message);
    scheduleReconnect("auth_failure");
  });

  nextClient.on("ready", () => {
    ready = true;
    reconnectAttempts = 0;
    events.emit("ready");
  });

  nextClient.on("change_state", (state) => {
    events.emit("change_state", state);
  });

  nextClient.on("disconnected", (reason) => {
    ready = false;
    events.emit("disconnected", reason);
    scheduleReconnect(reason || "disconnected");
  });

  return nextClient;
};

const initialize = async () => {
  if (initializing) return;

  initializing = true;
  try {
    if (!client) client = createClient();
    await client.initialize();
  } catch (error) {
    ready = false;
    console.error("WhatsApp client initialize error:", error);
    scheduleReconnect("initialize_error");
  } finally {
    initializing = false;
  }
};

const scheduleReconnect = (reason) => {
  if (reconnectTimer) return;

  const delay = Math.min(2000 * 2 ** reconnectAttempts, maxReconnectDelayMs);
  reconnectAttempts += 1;

  console.warn(`WhatsApp client reconnect scheduled in ${delay}ms. Reason: ${reason}`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;

    const staleClient = client;
    client = null;

    if (staleClient) {
      try {
        await staleClient.destroy();
      } catch (error) {
        console.warn("WhatsApp client destroy warning:", error.message);
      }
    }

    await initialize();
  }, delay);
};

const getState = async () => {
  if (!client) return null;

  try {
    return await client.getState();
  } catch (error) {
    const now = Date.now();

    if (now - lastStateWarningAt > stateWarningIntervalMs) {
      console.warn("Could not read WhatsApp client state:", error.message);
      lastStateWarningAt = now;
    }

    return null;
  }
};

const sendMessage = async (...args) => {
  if (!client || !ready) {
    throw createNotReadyError();
  }

  try {
    return await client.sendMessage(...args);
  } catch (error) {
    if (isTransientPuppeteerError(error)) {
      ready = false;
      console.warn("WhatsApp client transient browser error:", error.message);
      scheduleReconnect("transient_browser_error");
      throw createNotReadyError();
    }

    throw error;
  }
};

const destroy = async () => {
  ready = false;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const staleClient = client;
  client = null;

  if (staleClient) {
    await staleClient.destroy();
  }
};

module.exports = {
  initialize,
  getState,
  sendMessage,
  destroy,
  isReady: () => ready,
  on: (...args) => events.on(...args),
  once: (...args) => events.once(...args),
  off: (...args) => events.off(...args),
};
