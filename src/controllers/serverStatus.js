const getServerStatus = async (req,res) => {
return res.status(200).send("ready")
}

module.exports = getServerStatus