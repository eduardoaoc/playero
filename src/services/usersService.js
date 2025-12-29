import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const usersService = {
  async listUsers() {
    const response = await apiClient.get('/api/v1/users');
    return unwrap(response);
  },
  async createUser(payload) {
    const response = await apiClient.post('/api/v1/users', payload);
    return unwrap(response);
  },
  async updateUser(id, payload) {
    const response = await apiClient.put(`/api/v1/users/${id}`, payload);
    return unwrap(response);
  },
  async updateStatus(id, payload) {
    const response = await apiClient.patch(`/api/v1/users/${id}/status`, payload);
    return unwrap(response);
  },
  async updatePassword(id, payload) {
    const response = await apiClient.put(`/api/v1/users/${id}/password`, payload);
    return unwrap(response);
  },
  async resetPassword(payload) {
    const response = await apiClient.post('/api/v1/users/reset-password', payload);
    return unwrap(response);
  },
};
