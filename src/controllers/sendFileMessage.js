const client = require("../client/client")
const { MessageMedia } = require('whatsapp-web.js');

const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];
const numberRegex = /^549\d{10}$/;

const sendFileMessage = async (req, res) => {
  try {
    const { number, file, mimeType } = req.body;
    if (!number) throw Error("Ingrese el numero del destinatario");
    if (!number.match(numberRegex)) throw Error("El número es incorrecto");
    if (!file) throw Error("No se encontró el archivo adjunto");
    if (!allowedMimeTypes.includes(mimeType)) throw Error("Tipo de archivo no permitido");

    const base64 = file.replace(/^data:.*;base64,/, ""); // limpia dataURL
    const media = new MessageMedia(mimeType, base64, "receta"); // sin 4º arg

    await client.sendMessage(
      `${number}@c.us`,
      media,
      { caption: "receta", sendMediaAsDocument: mimeType === "application/pdf" }
    );

    return res.status(200).json({ message: "mensaje enviado" });
  } catch (error) {
    // Workaround: si es el bug de serialize, respondé 200 igual
    const msg = String(error?.message || error);
    if (msg.includes("getMessageModel") && msg.includes("serialize")) {
      console.warn("Warning interno de WhatsApp Web (serialize), pero el mensaje suele salir igual.");
      return res.status(200).json({ message: "mensaje enviado (con warning interno)" });
    }
    console.error("sendFileMessage error:", error);
    return res.status(400).send(`Error al enviar el mensaje: ${error.message}`);
  }
};

module.exports = sendFileMessage