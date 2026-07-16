const client = require("../client/client");

const getServerStatus = async (req,res) => {
  const whatsappState = await client.getState();

  return res.status(200).json({
    server: "ready",
    whatsapp: client.isReady() ? "ready" : "not_ready",
    whatsappState,
  });
}

module.exports = getServerStatus
