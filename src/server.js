// src/server.js
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets');

require('dotenv').config();

connectDB();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
