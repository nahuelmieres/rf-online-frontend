import React from 'react';
import { useChat } from '../context/ChatContext';

export default function MessageBubble({ msg }) {
  const { state } = useChat();

  // Manejar diferentes estructuras de senderId
  const senderId = msg.senderId?._id || msg.senderId;
  const mine = senderId === state.userId;
  const read = msg.read || (msg.readBy && msg.readBy.length > 0);
  const isTemp = msg.isTemp;

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} py-1`}>
      <div
        className={`
          max-w-[75%] px-3 py-2 rounded-xl
          ${mine
            ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-gray-600'
            : 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-gray-600'}
          ${isTemp ? 'opacity-70' : ''}
          shadow-hard
        `}
      >
        {/* Mostrar nombre si no es nuestro mensaje y tiene información del remitente */}
        {!mine && msg.senderId && typeof msg.senderId === 'object' && msg.senderId.nombre && (
          <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
            {msg.senderId.nombre}
          </div>
        )}

        <div className="whitespace-pre-wrap break-words text-sm">{msg.text}</div>

        <div className="mt-1 text-[10px] opacity-70 flex items-center gap-2">
          <span>{isTemp ? 'Enviando…' : (read ? 'Leído' : 'Enviado')}</span>
          <span className="opacity-50">•</span>
          <time dateTime={msg.createdAt}>
            {new Date(msg.createdAt).toLocaleTimeString()}
          </time>
        </div>

      </div>
    </div>
  );
}