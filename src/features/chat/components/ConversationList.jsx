import React, { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ConversationList() {
  const { state, reloadConversations, dispatch } = useChat();

  useEffect(() => {
    reloadConversations();
  }, []);

  return (
    <aside className="w-full md:w-80 border-r-2 border-black dark:border-gray-600 overflow-y-auto
                      bg-white dark:bg-black">
      <div className="px-4 py-3 text-xs font-bold
                      border-b-2 border-black dark:border-gray-600">
        {state.connected ? 'Conectado' : 'Reconectando…'}
      </div>

      {state.conversations.map((c) => {
        const lm = c.lastMessage;
        const active = state.activeId === c._id;
        return (
          <button
            key={c._id}
            onClick={() => dispatch({ type: 'SET_ACTIVE', id: c._id })}
            className={`w-full text-left px-4 py-3 flex items-center gap-3
                        ${active ? 'bg-gray-100 dark:bg-zinc-900' : 'bg-white dark:bg-black'}
                        hover:translate-x-0.5 hover:translate-y-0.5 transition-all`}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold">Conv {c._id.slice(-4)}</span>
                <span className="text-[11px] text-gray-600 dark:text-gray-400">
                  {lm?.timestamp ? dayjs(lm.timestamp).fromNow() : ''}
                </span>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                {lm?.text || 'Sin mensajes'}
              </div>
            </div>
            {c.unreadCount > 0 && (
              <span className="text-[10px] bg-black dark:bg-white text-white dark:text-black
                               px-2 py-0.5 rounded-full border-2 border-black dark:border-gray-600">
                {c.unreadCount}
              </span>
            )}
          </button>
        );
      })}

      {state.conversations.length === 0 && (
        <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No tenés conversaciones todavía.</div>
      )}
    </aside>
  );
}