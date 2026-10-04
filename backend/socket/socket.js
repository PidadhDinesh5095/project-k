import { Server } from 'socket.io';
import __cjsModule590 from '../utils/tokenService.js';
const { verifyAccessToken } = __cjsModule590;

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });

  // Auth handshake — the app connects with its access token, socket joins a
  // room named after the userId so we can target events at exactly one user.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    console.log(`[socket] user ${socket.userId} connected`);
  });

  return io;
}

// emitToUser() is what order/subscription controllers call after a status
// change, e.g. emitToUser(userId, 'order:status_updated', { orderId, status }).
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export default { initSocket, emitToUser };
