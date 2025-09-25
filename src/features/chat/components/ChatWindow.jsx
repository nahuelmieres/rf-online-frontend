import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAutoScroll } from '../hooks/useAutoScroll';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const { state, loadMessages, send, markRead } = useChat();
  const [text, setText] = useState('');
  const msgs = state.activeId ? (state.messages[state.activeId] || []) : [];
  const endRef = useAutoScroll([state.activeId, msgs.length]);

  // DEBUG: ver si tenemos conversación activa
  useEffect(() => {
    // eslint-disable-next-line no-console
  }, [state.activeId, msgs.length]);

  useEffect(() => {
    const id = state.activeId;
    if (!id) return;
    (async () => {
      try {
        await loadMessages(id);
        await markRead(id);
      } catch (e) {
        console.error('[ChatWindow] loadMessages/markRead error:', e);
      }
    })();
  }, [state.activeId]);

  if (!state.activeId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-300">
        Seleccioná una conversación
      </div>
    );
  }

  async function onSend(e) {
    e.preventDefault();
    const id = state.activeId;
    const value = text.trim();
    if (!id || !value) return;
    try {
      await send(id, value);
      setText('');
    } catch (e) {
      console.error('[ChatWindow] send error:', e);
    }
  }

  return (
    <section className="flex-1 flex flex-col bg-white dark:bg-black">
      <div className="flex-1 overflow-y-auto p-4">
        {msgs.map((m) => <MessageBubble key={m._id} msg={m} />)}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend}
            className="p-3 border-t-2 border-black dark:border-gray-600 flex gap-2 bg-white dark:bg-black">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí un mensaje…"
          className="flex-1 px-3 py-2 border-2 border-black dark:border-gray-600
                     bg-white dark:bg-black text-black dark:text-white
                     rounded-lg shadow-hard focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 border-2 border-black dark:border-gray-600
                     bg-white dark:bg-black text-black dark:text-white font-bold
                     rounded-lg shadow-hard hover:shadow-none
                     hover:translate-x-0.5 hover:translate-y-0.5 transition-all
                     disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}