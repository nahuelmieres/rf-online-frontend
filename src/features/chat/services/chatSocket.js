import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ['websocket'],
    auth: (cb) => {
      let token = localStorage.getItem('token');
      try { token = token ? JSON.parse(token) : token; } catch {}
      cb({ token });
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
  return socket;
}