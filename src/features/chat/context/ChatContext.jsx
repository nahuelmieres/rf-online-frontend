import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ChatAPI } from '../services/chatApi';
import { getSocket } from '../services/chatSocket';
import { notifyNewMessage } from '../services/notifications';

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
      const prev = state.messages[action.conversationId] || [];
      const next = [...prev, action.message];
      const updated = state.conversations
        .map(c => c._id === action.conversationId
          ? ({
              ...c,
              lastMessage: {
                text: action.message.text,
                senderId: action.message.senderId,
                timestamp: action.message.createdAt || new Date().toISOString()
              }
            })
          : c)
        .sort((a, b) => (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || ''));
      return { ...state, messages: { ...state.messages, [action.conversationId]: next }, conversations: updated };
    }
    case 'SET_CONNECTED':
      return { ...state, connected: action.value };
    case 'MARK_READ':
      return {
        ...state,
        conversations: state.conversations.map(c => c._id === action.conversationId ? ({ ...c, unreadCount: 0 }) : c)
      };
    default:
      return state;
  }
}

export function ChatProvider({ userId, children }) {
  const [state, dispatch] = useReducer(reducer, {
    userId,
    conversations: [],
    activeId: null,
    messages: {},
    connected: false,
  });

  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    dispatch({ type: 'INIT', userId });

    const onConnect = () => dispatch({ type: 'SET_CONNECTED', value: true });
    const onDisconnect = () => dispatch({ type: 'SET_CONNECTED', value: false });
    const onNewMessage = async (msg) => {
      dispatch({ type: 'PUSH_MESSAGE', conversationId: msg.conversationId, message: msg });

      // notificación si no es la conversación activa o está en background
      if (typeof document !== 'undefined') {
        const inactive = state.activeId !== msg.conversationId || document.hidden;
        const fromOther = msg.senderId !== state.userId;
        if (inactive && fromOther) {
          await notifyNewMessage({ body: msg.text });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, userId, state.activeId, state.userId]);

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
    await ChatAPI.sendMessage(id, text);
  }

  async function markRead(id) {
    await ChatAPI.markRead(id);
    dispatch({ type: 'MARK_READ', conversationId: id });
  }

  // join a sala al cambiar la conversación activa
  useEffect(() => {
    const id = state.activeId;
    if (!id) return;
    const s = getSocket();
    s.emit('join-conversation', { conversationId: id });
  }, [state.activeId]);

  return (
    <ChatCtx.Provider value={{ state, dispatch, reloadConversations, loadMessages, send, markRead }}>
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChat debe usarse dentro de <ChatProvider>');
  return ctx;
}
