import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ChatAPI = {
  getUserConversations(userId) {
    return api.get(`/api/chat/conversations/user/${userId}`).then(r => r.data);
  },
  getMessages(conversationId) {
    return api.get(`/api/chat/conversations/${conversationId}/messages`).then(r => r.data);
  },
  sendMessage(conversationId, text) {
    return api.post(`/api/chat/messages`, { conversationId, text }).then(r => r.data);
  },
  markRead(conversationId) {
    return api.post(`/api/chat/conversations/${conversationId}/read`, {});
  },
  createOrGetConversation(participantId) {
    return api.post(`/api/chat/conversations`, { participantId }).then(r => r.data);
  },
  deleteConversation(conversationId) {
    return api.delete(`/api/chat/conversations/${conversationId}`);
  },

  // listar usuarios según roles (cliente → admin/coach; admin/coach → cliente)
  async getUsersByRoles(roles = [], page = 1, limit = 50) {
    const params = new URLSearchParams();
    roles.forEach(r => params.append('rol', r));
    params.append('page', page);
    params.append('limit', limit);

    const { data } = await api.get(`/api/usuarios/clientes?${params.toString()}`);
    return data?.data?.usuarios || [];
  },
};

export { api };
