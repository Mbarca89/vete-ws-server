const client = require("../client/client")

const sendWaMessage = async (req, res) => {
    const numberRegex = /^549\d{10}$/;

    try {
        const { number, message } = req.body
        if (!number) throw Error("Ingrese el numero del destinatario")
        if (!number.match(numberRegex)) throw Error("El número es incorrecto")
        if (!message) throw Error("Ingrese el mensaje")
        const response = await client.sendMessage(`${number}@c.us`, message, { sendSeen: false });
        return res.status(200).json({ message: "mensaje enviado" })
    } catch (error) {
        const statusCode = error.statusCode || 400;
        const message = statusCode === 503
            ? "WhatsApp web no esta conectado. Intente nuevamente en unos segundos."
            : `Faltan datos: ${error.message}`;

        return res.status(statusCode).json({ message })
    }
}

module.exports = sendWaMessage
