const { Router } = require('express');
const getServerStatus = require("../controllers/serverStatus")

const serverRoutes = Router();
serverRoutes.get("/getServerStatus", getServerStatus)

module.exports = serverRoutes;