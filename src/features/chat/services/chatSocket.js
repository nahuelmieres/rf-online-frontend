// src/features/chat/services/chatSocket.js
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;

  // Si VITE_SOCKET_URL está vacío/undefined, Socket.io usa el origen actual (http://localhost:5173),
  // y gracias al proxy /socket.io termina en http://localhost:3000 sin CORS.
  const url = import.meta.env.VITE_SOCKET_URL || undefined;

  socket = io(url, {
    transports: ['websocket'],
    // path: '/socket.io', // opcional (default ya es /socket.io)
    auth: (cb) => {
      const token = localStorage.getItem('token');
      cb({ token });
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
  return socket;
}