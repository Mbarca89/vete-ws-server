const { Router } = require('express');
const sendWaMessage = require("../controllers/sendMessage")
const sendFileMessage = require("../controllers/sendFileMessage")

const wsRoutes = Router();
wsRoutes.post("/send", sendWaMessage)
wsRoutes.post("/sendFile", sendFileMessage)

module.exports = wsRoutes;