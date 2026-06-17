import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env';

let io: Server;

export function initSocket(httpServer: HttpServer): void {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}

export function getSocket(): Server {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

export function emitReadingUpdate(data: unknown): void {
  getSocket().emit('reading_update', data);
}

export function emitIntrusionAlert(data: unknown): void {
  getSocket().emit('intrusion_alert', data);
}
