import React from 'react';
import { useChat } from '../context/ChatContext';

export default function MessageBubble({ msg }) {
  const { state } = useChat();
  const mine = msg.senderId === state.userId;
  const read = msg.read || (msg.readBy && msg.readBy.length > 0);

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} py-1`}>
      <div
        className={`
          max-w-[75%] px-3 py-2 rounded-xl
          ${mine
            ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-gray-600'
            : 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-gray-600'}
          shadow-hard
        `}
      >
        <div className="whitespace-pre-wrap break-words text-sm">{msg.text}</div>
        <div className="mt-1 text-[10px] opacity-70">{read ? 'leído' : 'enviado'}</div>
      </div>
    </div>
  );
}