import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import ChatAPI from '../services/chatApi';
import { getSocket } from '../services/chatSocket';

const ChatCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, userId: action.userId };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };
    case 'SET_ACTIVE':
      return { ...state, activeId: action.id };
    case 'SET_MESSAGES':
      return { ...state, messages: { ...state.messages, [action.conversationId]: action.items } };
    case 'PUSH_MESSAGE': {
      const { conversationId, message } = action;
      const prev = state.messages[conversationId] || [];
      const next = [...prev, message];

      const isMine = String(message.senderId) === String(state.userId);
      const isActive = state.activeId === conversationId;

      // ¿la conversación existe en memoria?
      const exists = state.conversations.some(c => c._id === conversationId);

      let list = state.conversations.map(c => {
        if (c._id !== conversationId) return c;

        const newUnread = isMine || isActive
          ? 0
          : (c.unreadCount || 0) + 1;

        return {
          ...c,
          lastMessage: {
            text: message.text,
            senderId: message.senderId,
            timestamp: message.createdAt || new Date().toISOString(),
          },
          unreadCount: newUnread,
        };
      });

      // si no existía (p. ej. primer mensaje o lista aún no cargada), la insertamos
      if (!exists) {
        list = [
          {
            _id: conversationId,
            participants: [],
            isActive: true,
            unreadCount: isMine ? 0 : 1,
            lastMessage: {
              text: message.text,
              senderId: message.senderId,
              timestamp: message.createdAt || new Date().toISOString(),
            },
          },
          ...list,
        ];
      }

      // ordenar por última actividad
      list.sort((a, b) =>
        (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || '')
      );

      return {
        ...state,
        messages: { ...state.messages, [conversationId]: next },
        conversations: list,
      };
    }
    case 'UPSERT_CONVERSATION': {
      const exists = state.conversations.some(c => c._id === action.conversation._id);
      const list = exists
        ? state.conversations.map(c => (c._id === action.conversation._id ? { ...c, ...action.conversation } : c))
        : [action.conversation, ...state.conversations];
      list.sort((a, b) => (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || ''));
      return { ...state, conversations: list };
    }
    case 'SET_CONNECTED':
      return { ...state, connected: action.value };
    case 'MARK_READ':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c._id === action.conversationId ? { ...c, unreadCount: 0 } : c
        ),
      };
    default:
      return state;
  }
}

// helper: extrae la conversación del shape que devuelva tu API
function extractConversation(resp) {
  // puede venir como Document plano
  if (resp && resp._id) return resp;
  // o envuelto
  if (resp?.data?.conversation?._id) return resp.data.conversation;
  if (resp?.data?._id) return resp.data;
  if (resp?.conversation?._id) return resp.conversation;
  return null;
}

export function ChatProvider({ userId, children }) {
  const [state, dispatch] = React.useReducer(reducer, {
    userId,
    conversations: [],
    activeId: null,
    messages: {},
    connected: false,
  });

  const socket = useMemo(() => getSocket(), []);

  // conexión socket + eventos
  useEffect(() => {
    dispatch({ type: 'INIT', userId });

    const onConnect = () => dispatch({ type: 'SET_CONNECTED', value: true });
    const onDisconnect = () => dispatch({ type: 'SET_CONNECTED', value: false });

    const onNewMessage = async (msg) => {
      // push al estado (esto ya mueve la conversación arriba y maneja unreadCount)
      dispatch({ type: 'PUSH_MESSAGE', conversationId: msg.conversationId, message: msg });

      // si estoy viendo esa conversación y el mensaje es del otro, lo marco leído de una
      const isActive = String(msg.conversationId) === String(state.activeId);
      const isMine = String(msg.senderId) === String(state.userId);
      if (isActive && !isMine) {
        try {
          await ChatAPI.markRead(msg.conversationId, state.userId);
          dispatch({ type: 'MARK_READ', conversationId: msg.conversationId });
        } catch (e) {
          console.warn('[socket] markRead failed:', e?.response?.data || e);
        }
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-message', onNewMessage);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-message', onNewMessage);
    };
  }, [socket, userId, state.activeId, state.userId]);


  // cuando cambia la conversación activa, unirse a la sala
  useEffect(() => {
    if (!state.activeId) return;
    try {
      socket.emit('join-conversation', { conversationId: state.activeId });
      // console.log('[socket] joined room', state.activeId);
    } catch (e) {
      console.warn('[socket] join-conversation error:', e);
    }
  }, [socket, state.activeId]);

  async function reloadConversations() {
    if (!state.userId) return;
    const data = await ChatAPI.getUserConversations(state.userId);
    data.sort((a, b) => (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || ''));
    dispatch({ type: 'SET_CONVERSATIONS', conversations: data });
  }

  async function loadMessages(id) {
    const items = await ChatAPI.getMessages(id);
    dispatch({ type: 'SET_MESSAGES', conversationId: id, items });
  }

  async function send(id, text) {
    const temp = {
      _id: `tmp-${Date.now()}`,
      conversationId: id,
      senderId: state.userId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
      readBy: [],
    };
    dispatch({ type: 'PUSH_MESSAGE', conversationId: id, message: temp });
    await ChatAPI.sendMessage(id, text, state.userId); // back exige senderId
  }

  async function markRead(id) {
    await ChatAPI.markRead(id, state.userId); // back exige userId
    dispatch({ type: 'MARK_READ', conversationId: id });
  }

  // robusto: crea/obtiene conv, extrae id, y si falla, cae al plan B
  async function startConversationWith(otherUserId) {
    const myId = String(state.userId || '').trim();
    const target = String(otherUserId || '').trim();

    if (!myId || !target || myId === target) {
      throw new Error('IDs inválidos para iniciar conversación');
    }

    // 1) intento directo a la API
    let convDoc = null;
    try {
      const raw = await ChatAPI.createOrGetConversation(myId, target);
      convDoc = extractConversation(raw) || raw;
      // console.log('[createOrGetConversation] raw=', raw, 'convDoc=', convDoc);
    } catch (e) {
      console.error('[startConversationWith] createOrGetConversation error:', e?.response?.data || e);
    }

    // 2) si no pude sacar _id, plan B: buscarla en todas las conversaciones
    let convId = convDoc?._id;
    if (!convId) {
      try {
        const all = await ChatAPI.getUserConversations(myId);
        const found = (all || []).find(c =>
          Array.isArray(c.participants) &&
          c.participants.some(p => String(p.userId?._id || p.userId) === target)
        );
        if (found) convId = found._id;
        // console.log('[fallback] found=', found);
      } catch (e) {
        console.error('[startConversationWith] fallback getUserConversations error:', e?.response?.data || e);
      }
    }

    if (!convId) {
      throw new Error('No se pudo obtener/crear la conversación');
    }

    const normalized = { unreadCount: 0, isActive: true, ...(convDoc || {}), _id: convId };
    dispatch({ type: 'UPSERT_CONVERSATION', conversation: normalized });
    dispatch({ type: 'SET_ACTIVE', id: convId });
    try { await loadMessages(convId); } catch { }
    return normalized;
  }

  return (
    <ChatCtx.Provider
      value={{
        state,
        dispatch,
        reloadConversations,
        loadMessages,
        send,
        markRead,
        startConversationWith,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChat debe usarse dentro de <ChatProvider>');
  return ctx;
}