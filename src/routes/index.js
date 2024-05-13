const { Router } = require('express');
const wsRoutes = require('./wsRoutes.js')
const serverRoutes = require("./serverRoutes.js")

const router = Router();

router.use('/ws', wsRoutes)
router.use('/server', serverRoutes)


module.exports = router;
