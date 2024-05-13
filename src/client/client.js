const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode')

const client = new Client({
    authStrategy: new LocalAuth()
});

module.exports = client;