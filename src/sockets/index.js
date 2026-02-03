// src/sockets/index.js
const { Server } = require('socket.io');

let io;
const onlineUsers = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      onlineUsers[userId] = socket.id;
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = initSocket;
