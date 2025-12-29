import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;
const AUTH_BASE = '/api/v1/auth';

export async function login(email, password) {
  // No cookies or CSRF; use Bearer token only.
  const response = await apiClient.post(`${AUTH_BASE}/login`, { email, password });
  return unwrap(response);
}

export async function me() {
  const response = await apiClient.get(`${AUTH_BASE}/me`);
  return unwrap(response);
}

export async function logout() {
  const response = await apiClient.post(`${AUTH_BASE}/logout`);
  return unwrap(response);
}
