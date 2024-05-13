const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const client = require("./src/client/client")
const QRCode = require('qrcode');
const routes = require("./src/routes/index");
const cors = require("cors")

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let generatedQR = null;
let clientInitialized = false;

client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);
    try {
      const qrDataURL = await QRCode.toDataURL(qr);
      io.emit('qr', qrDataURL);
      generatedQR = qrDataURL;
  } catch (error) {
      console.error('Error generating QR code:', error);
  }
});

client.on('ready', async () => {
    console.log('Client is ready!');
    clientInitialized = true;
    io.emit('ready', 'WhatsApp web esta conectado!');
});

client.on('disconnected', (reason) => {
    console.log('client disconnected:', reason);
    io.emit('logedOut', 'WhatsApp web esta desconectado!');
});

client.initialize();

io.on('connection', async (socket) => {
    console.log('Client connected');
    if(clientInitialized) {
      const clientStatus = await client.getState()
      console.log(clientStatus)
      if(clientStatus == "CONNECTED") io.emit('ready', 'WhatsApp web esta conectado!');
    }
    io.emit('serverReady', 'Server Started')
    if (generatedQR) {
        socket.emit('qr', generatedQR);
    }
    socket.on('disconnect', () => {
        console.log('Client disconnected');       
    });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);
app.use(cors())

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
