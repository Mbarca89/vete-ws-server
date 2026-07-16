const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const client = require("./src/client/client")
const QRCode = require('qrcode');
const routes = require("./src/routes/index");
const cors = require("cors")
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let generatedQR = null;
let clientInitialized = false;

const isClientConnected = async () => {
  if (!clientInitialized && !client.isReady()) return false;

  const clientStatus = await client.getState();
  console.log("Client status: ", clientStatus);
  return clientStatus === "CONNECTED" || client.isReady();
};

client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);
    try {
      const qrDataURL = await QRCode.toDataURL(qr);
      io.emit('qr', qrDataURL);
      generatedQR = qrDataURL;
  } catch (error) {
      console.error('Error generating QR code:', error);
  }
});

client.on('ready', async () => {
    console.log('Client is ready!');
    clientInitialized = true;
    io.emit('ready', 'WhatsApp web esta conectado!');
});

client.on('authenticated', () => {
    console.log('Client authenticated');
});

client.on('auth_failure', (message) => {
    console.log('client auth failure:', message);
    clientInitialized = false;
    generatedQR = null;
    io.emit('logedOut', 'WhatsApp web necesita autenticarse de nuevo!');
});

client.on('change_state', (state) => {
    console.log('Client state changed:', state);
});

client.on('disconnected', (reason) => {
    console.log('client disconnected:', reason);
    clientInitialized = false;
    io.emit('logedOut', 'WhatsApp web esta desconectado!');
});

client.initialize();

io.on('connection', async (socket) => {
    console.log('Client connected');
    if(await isClientConnected()) {
      io.emit('ready', 'WhatsApp web esta conectado!');
    }
    io.emit('serverReady', 'Server Started')
    if (generatedQR) {
        socket.emit('qr', generatedQR);
    }
    socket.on('disconnect', () => {
        console.log('Client disconnected');       
    });
});

app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" })); 

const corsOptions = {
  origin: '*', // Cambia esto si usas otro puerto en React
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Auth-Token', "Authorization"],
};

app.use(cors(corsOptions)); // Configura CORS primero

app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use('/', routes);

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});

const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server and WhatsApp client...`);

    const forceExitTimer = setTimeout(() => process.exit(1), 10000);
    forceExitTimer.unref();

    try {
        io.close();
        server.close();
        await client.destroy();
        clearTimeout(forceExitTimer);
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
