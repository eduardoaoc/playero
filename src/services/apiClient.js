import axios from 'axios';
import { clearStoredSession, getStoredToken } from '../stores/authStorage';

// Base URL must come from VITE_API_BASE_URL (no manual /public or /api here).
const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');
const API_PREFIX = '/api/v1';

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url || '');

const normalizeUrl = (url) => {
  if (!url) {
    return API_PREFIX;
  }
  if (isAbsoluteUrl(url)) {
    return url;
  }
  if (url.startsWith(API_PREFIX)) {
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_PREFIX}${normalized}`;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  // Ensure every request uses the /api/v1 prefix unless it is already present.
  if (nextConfig.url) {
    nextConfig.url = normalizeUrl(nextConfig.url);
  }

  // Attach Bearer token from localStorage when available.
  const token = getStoredToken();
  if (token) {
    nextConfig.headers = {
      ...nextConfig.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error?.response;
    const status = response?.status;
    const data = response?.data;
    const isNetworkError = !response;

    // Normalize backend and network errors for consistent UI handling.
    error.normalized = {
      status: status ?? 0,
      success: data?.success ?? false,
      message: isNetworkError
        ? 'Falha ao conectar com a API.'
        : data?.message ?? data?.error ?? error?.message ?? 'Erro inesperado.',
      data: data?.data ?? data,
      errors: data?.errors ?? null,
      isAuthError: status === 401,
      isForbidden: status === 403,
      isNetworkError,
    };

    // 401: clear session and force login, 403: keep session and let UI show message.
    if (status === 401) {
      clearStoredSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export const apiConfig = {
  API_BASE_URL,
  API_PREFIX,
};

export default apiClient;
