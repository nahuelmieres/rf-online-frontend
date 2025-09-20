import React, { useEffect, useMemo, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { ChatAPI } from '../services/chatApi';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ConversationList({ userRole: roleProp }) {
  const { state, reloadConversations, dispatch, startConversationWith } = useChat();

  // rol desde prop o storage (fallback)
  const stored = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
  }, []);
  const userRole = roleProp || stored?.rol || 'cliente';

  // Reglas de visibilidad de contactos
  const targetRoles = useMemo(
    () => (userRole === 'cliente' ? ['admin', 'coach'] : ['cliente']),
    [userRole]
  );

  // Estado de contactos
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Cargar conversaciones al montar
  useEffect(() => {
    reloadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar contactos por rol
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingContacts(true);
        let listado = await ChatAPI.getUsersByRoles(targetRoles, 1, 50);
        // no mostrarte a vos (asegurar string)
        const myId = String(state.userId || '');
        listado = (listado || []).filter(u => String(u._id) !== myId);
        if (mounted) setContacts(listado);
      } catch (e) {
        console.error('[contacts] error:', e);
        if (mounted) setContacts([]);
      } finally {
        if (mounted) setLoadingContacts(false);
      }
    })();
    return () => { mounted = false; };
  }, [targetRoles, state.userId]);

  async function handlePickContact(otherUserId) {
    const myId = String(state.userId || '').trim();
    const otherId = String(otherUserId || '').trim();

    if (!myId || !otherId || myId === otherId) {
      console.warn('IDs inválidos para iniciar conversación');
      return;
    }
    try {
      await startConversationWith(otherId);
    } catch (e) {
      const msg = e?.response?.data?.mensaje || e.message || 'Error creando/abriendo conversación';
      console.error('[handlePickContact] error:', msg, e?.response || e);
    }
  }

  async function handleDeleteConversation(e, convId) {
    // evitar que se active la conversación al clickear el basurero
    e.preventDefault();
    e.stopPropagation();

    const confirmar = window.confirm('¿Eliminar esta conversación? No se borrarán los mensajes del otro usuario.');
    if (!confirmar) return;

    try {
      await ChatAPI.deleteConversation(convId);
      // si era la activa, limpiá la selección
      if (state.activeId === convId) {
        dispatch({ type: 'SET_ACTIVE', id: null });
      }
      // refrescar lista desde el backend (simple y robusto)
      await reloadConversations();
    } catch (err) {
      const msg = err?.response?.data?.mensaje || err.message || 'No se pudo eliminar la conversación';
      console.error('[deleteConversation] error:', msg);
      alert(msg);
    }
  }

  return (
    <aside className="w-full md:w-80 border-r-2 border-black dark:border-gray-600 overflow-y-auto
                      bg-white dark:bg-black">
      {/* Estado socket */}
      <div className="px-4 py-3 text-xs font-bold
                      border-b-2 border-black dark:border-gray-600">
        {state.connected ? 'Conectado' : 'Reconectando…'}
      </div>

      {/* Contactos */}
      <div className="border-b-2 border-black dark:border-gray-600">
        <div className="px-4 py-2 text-xs font-extrabold text-gray-700 dark:text-gray-200
                        flex items-center justify-between">
          <span>Contactos</span>
          {loadingContacts ? (
            <span className="opacity-60">cargando…</span>
          ) : (
            <span className="opacity-60">{contacts.length}</span>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loadingContacts && contacts.length === 0 && (
            <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">
              Buscando usuarios…
            </div>
          )}
          {!loadingContacts && contacts.length === 0 && (
            <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">
              No hay usuarios disponibles.
            </div>
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
                <div className="text-sm font-extrabold">{u.nombre || 'Usuario'}</div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">{u.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversaciones */}
      <div className="px-4 py-2 text-xs font-extrabold text-gray-700 dark:text-gray-200
                      border-b-2 border-black dark:border-gray-600">
        Conversaciones
      </div>

      {state.conversations.map((c) => {
        const lm = c.lastMessage;
        const active = state.activeId === c._id;
        
        // Mostrar SIEMPRE el "otro" participante
        const otherParticipant = (c.participants || []).find(
          p => String(p.userId?._id || p.userId) !== String(state.userId || '')
        );
        const displayName = otherParticipant
          ? (otherParticipant.userId?.nombre || 'Usuario')
          : 'Usuario';

        return (
          <div
            key={c._id}
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ type: 'SET_ACTIVE', id: c._id })}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: 'SET_ACTIVE', id: c._id })}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer
                        ${active ? 'bg-gray-100 dark:bg-zinc-900' : 'bg-white dark:bg-black'}
                        hover:translate-x-0.5 hover:translate-y-0.5 transition-all`}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold">{displayName}</span>
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

            {/* Botón eliminar */}
            <button
              aria-label="Eliminar conversación"
              title="Eliminar conversación"
              onClick={(e) => handleDeleteConversation(e, c._id)}
              className="ml-2 inline-flex items-center justify-center p-0 bg-transparent border-0
             text-black dark:text-white hover:opacity-70 focus:outline-none transition-opacity"
            >
              <Trash2 size={16} className="pointer-events-none" />
            </button>

          </div>
        );
      })}

      {state.conversations.length === 0 && (
        <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
          No tenés conversaciones todavía.
        </div>
      )}
    </aside>
  );
}