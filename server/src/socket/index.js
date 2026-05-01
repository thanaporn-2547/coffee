const { Server } = require('socket.io');
const { verifyAccessToken } = require('../config/jwt');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`☕ Socket connected: ${socket.user.id} (${socket.user.role})`);
    socket.join(`user:${socket.user.id}`);
    if (socket.user.role === 'admin') socket.join('admin');

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const emitToUser = (userId, event, data) => getIO().to(`user:${userId}`).emit(event, data);
const emitToAdmin = (event, data) => getIO().to('admin').emit(event, data);
const emitToAll = (event, data) => getIO().emit(event, data);

module.exports = { initSocket, getIO, emitToUser, emitToAdmin, emitToAll };