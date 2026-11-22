import axios from 'axios';

const defaultBaseUrl =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://mediconnect-api-lyni.onrender.com/api'
    : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || defaultBaseUrl
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mediconnect_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('mediconnect_token');
      localStorage.removeItem('mediconnect_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
