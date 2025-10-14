import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_STORAGE_KEY = 'label-tool.authToken';
const USER_STORAGE_KEY = 'label-tool.authUser';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const storage = typeof window !== 'undefined' ? window.localStorage : null;
  const token = storage?.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const storage = typeof window !== 'undefined' ? window.localStorage : null;
      storage?.removeItem(TOKEN_STORAGE_KEY);
      storage?.removeItem(USER_STORAGE_KEY);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
