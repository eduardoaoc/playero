import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;
const AUTH_BASE = '/api/v1/auth';

export const authService = {
  // Login returns { user, token } with a plain text token.
  async login(email, password) {
    const response = await apiClient.post(`${AUTH_BASE}/login`, { email, password });
    return unwrap(response);
  },
  // Fetch the authenticated user from /auth/me.
  async me() {
    const response = await apiClient.get(`${AUTH_BASE}/me`);
    return unwrap(response);
  },
  async refresh() {
    const response = await apiClient.post(`${AUTH_BASE}/refresh`);
    return unwrap(response);
  },
  async logout() {
    const response = await apiClient.post(`${AUTH_BASE}/logout`);
    return unwrap(response);
  },
};
