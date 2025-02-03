const client = require("../client/client")
const { MessageMedia } = require('whatsapp-web.js');
const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];

const sendFileMessage = async (req, res) => {
    const numberRegex = /^549\d{10}$/;

    try {
        const { number, file, mimeType } = req.body
        if (!number) throw Error("Ingrese el numero del destinatario")
        if (!number.match(numberRegex)) throw Error("El número es incorrecto")
        if (!file) throw Error("No se encontró el archivo adjunto")
        if (!allowedMimeTypes.includes(mimeType)) {
            throw Error("Tipo de archivo no permitido");
        }
        const media = new MessageMedia(mimeType, file, "receta", undefined);
        const response = await client.sendMessage(`${number}@c.us`, media)
        return res.status(200).json({ message: "mensaje enviado" })
    } catch (error) {
        return res.status(400).send(`Error al enviar el mensaje: ${error.message}`)
    }
}

module.exports = sendFileMessage