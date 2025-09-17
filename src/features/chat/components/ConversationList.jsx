// src/features/chat/components/ConversationList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { ChatAPI } from '../services/chatApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ConversationList({ userRole: roleProp }) {
  const { state, reloadConversations, dispatch, startConversationWith } = useChat();

  // rol desde prop o storage (fallback)
  const userRole = roleProp || localStorage.getItem('usuario')?.rol || 'cliente';

  // Regla: cliente -> [admin, coach]; admin/coach -> [cliente]
  const targetRoles = useMemo(() => {
    return userRole === 'cliente' ? ['admin', 'coach'] : ['cliente'];
  }, [userRole]);

  // Estado de contactos
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    reloadConversations();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingContacts(true);
        let listado = await ChatAPI.getUsersByRoles(targetRoles, 1, 50);
        // no mostrarte a vos
        listado = listado.filter(u => u._id !== state.userId);
        if (mounted) setContacts(listado);
      } finally {
        if (mounted) setLoadingContacts(false);
      }
    })();
    return () => { mounted = false; };
  }, [targetRoles, state.userId]);

  async function handlePickContact(userId) {
    await startConversationWith(userId);
  }

  return (
    <aside className="w-full md:w-80 border-r-2 border-black dark:border-gray-600 overflow-y-auto bg-white dark:bg-black">
      {/* Estado socket */}
      <div className="px-4 py-3 text-xs font-bold border-b-2 border-black dark:border-gray-600">
        {state.connected ? 'Conectado' : 'Reconectando…'}
      </div>

      {/* Contactos */}
      <div className="border-b-2 border-black dark:border-gray-600">
        <div className="px-4 py-2 text-xs font-extrabold text-gray-700 dark:text-gray-200 flex items-center justify-between">
          <span>Contactos</span>
          {loadingContacts ? (
            <span className="opacity-60">cargando…</span>
          ) : (
            <span className="opacity-60">{contacts.length}</span>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loadingContacts && contacts.length === 0 && (
            <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">Buscando usuarios…</div>
          )}
          {!loadingContacts && contacts.length === 0 && (
            <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">No hay usuarios disponibles.</div>
          )}
          {contacts.map(u => (
            <button
              key={u._id}
              onClick={() => handlePickContact(u._id)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 bg-white dark:bg-black
                         hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              title={u.email}
            >
              <img
                src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.nombre || u.email || 'U')}`}
                alt={u.nombre || u.email}
                className="w-8 h-8 rounded-full border-2 border-black dark:border-gray-600 object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-extrabold">{u.nombre}</div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">{u.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversaciones */}
      <div className="px-4 py-2 text-xs font-extrabold text-gray-700 dark:text-gray-200 border-b-2 border-black dark:border-gray-600">
        Conversaciones
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