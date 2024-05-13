const { Router } = require('express');
const sendWaMessage = require("../controllers/sendMessage")

const wsRoutes = Router();
wsRoutes.post("/send", sendWaMessage)

module.exports = wsRoutes;