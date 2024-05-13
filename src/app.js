const { Client } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const path = require('path');
const PORT = 3001


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

app.use(morgan('dev'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  if (req.method === "OPTIONS") {
    return res.status(200).end();
}
  next();
});


const client = new Client();

let generatedQR = null;


client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    generatedQR = qr;
    io.emit('qr', qr);
    io.emit('message', 'QR Code received, scan please!');
});

client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('message', 'WhatsApp client is ready!');
});

client.on('authenticated', () => {
    console.log('Authenticated');
    io.emit('message', 'WhatsApp client is authenticated!');
});

client.on('disconnected', (reason) => {
    console.log('client disconnected:', reason);

});

client.initialize();


io.on('connection', (socket) => {
    console.log('Client connected');

    if (generatedQR) {
        socket.emit('qr', generatedQR);
    }
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;
