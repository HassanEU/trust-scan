import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustscan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  getProfile: () => client.get('/auth/profile'),
};

export const analyzeAPI = {
  analyze: (productUrl) => client.post('/analyze', { productUrl }),
};

export const userAPI = {
  getHistory: (page = 1) => client.get(`/user/history?page=${page}`),
  getCheckById: (id) => client.get(`/user/history/${id}`),
  deleteCheck: (id) => client.delete(`/user/history/${id}`),
};

export default client;
