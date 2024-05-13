const client = require("../client/client")

const sendWaMessage = async (req, res) => {
    const numberRegex = /^549\d{9}$/;

    try {
        const { number, message } = req.body
        if (!number) throw Error("Ingrese el numero del destinatario")
        if (!number.match(argentinaPhoneNumberRegex)) throw Error ("El número es incorrecto")
        if (!message) throw Error("Ingrese el mensaje")

        const response = await client.sendMessage(`${number}@c.us`, message)
        return res.status(200).json({message: "mensaje enviado"})
    } catch (error) {
        return res.status(400).json({message:`Faltan datos: ${error.message}`})
    }
}

module.exports = sendWaMessage