import axios from 'axios';
import { clearStoredSession, getStoredToken } from '../stores/authStorage';

const RAW_API_URL = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = RAW_API_URL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredSession();
      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
