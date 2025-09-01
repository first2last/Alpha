import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Chat API
export const chatAPI = {
  getChats: () => api.get('/chat'),
  createChat: (participantId) => api.post('/chat', { participantId }),
  getMessages: (chatId, page = 1) => api.get(`/chat/${chatId}/messages?page=${page}`),
  sendMessage: (formData) => api.post('/chat/message', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMessage: (messageId) => api.delete(`/chat/message/${messageId}`),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getOnlineUsers: () => api.get('/users/online'),
};

export default api;
