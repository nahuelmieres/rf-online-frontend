import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  try { token = token ? JSON.parse(token) : token; } catch { }
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ChatAPI = {
  getUserConversations(userId) {
    return api.get(`/api/chat/conversations/user/${userId}`).then(r => r.data);
  },
  getMessages(conversationId) {
    return api.get(`/api/chat/conversations/${conversationId}/messages`)
      .then(r => r.data);
  },
  sendMessage(conversationId, text, senderId) {
    return api.post(`/api/chat/messages`, { conversationId, senderId, text }).then(r => r.data);
  },
  markRead(conversationId, userId) {
    return api.post(`/api/chat/conversations/${conversationId}/read`, { conversationId, userId }).then(r => r.data);
  },
  createOrGetConversation(userId1, userId2) {
    return api.post(`/api/chat/conversations`, { userId1, userId2 }).then(r => r.data);
  },
  deleteConversation(conversationId) {
    return api.delete(`/api/chat/conversations/${conversationId}`);
  },
  async getUsersByRoles(roles = [], page = 1, limit = 50) {
    const params = new URLSearchParams();
    roles.forEach(r => params.append('rol', r));
    params.append('page', page);
    params.append('limit', limit);
    const { data } = await api.get(`/api/usuarios/clientes?${params.toString()}`);
    return data?.data?.usuarios || [];
  },
};

export default ChatAPI;
export { ChatAPI };