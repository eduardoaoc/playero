import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const agendaService = {
  async getConfig() {
    const response = await apiClient.get('/api/v1/agenda/config');
    return unwrap(response);
  },
  async updateConfig(payload) {
    const response = await apiClient.put('/api/v1/agenda/config', payload);
    return unwrap(response);
  },
  async listExceptions() {
    const response = await apiClient.get('/api/v1/agenda/exceptions');
    return unwrap(response);
  },
  async createException(payload) {
    const response = await apiClient.post('/api/v1/agenda/exceptions', payload);
    return unwrap(response);
  },
  async updateException(id, payload) {
    const response = await apiClient.put(`/api/v1/agenda/exceptions/${id}`, payload);
    return unwrap(response);
  },
  async deleteException(id) {
    const response = await apiClient.delete(`/api/v1/agenda/exceptions/${id}`);
    return unwrap(response);
  },
  async getDay(params) {
    const response = await apiClient.get('/api/v1/agenda/day', { params });
    return unwrap(response);
  },
  async getMonth(params) {
    const response = await apiClient.get('/api/v1/agenda/month', { params });
    return unwrap(response);
  },
  async getBlockings() {
    const response = await apiClient.get('/api/v1/agenda/blockings');
    return unwrap(response);
  },
  async createBlocking(payload) {
    const response = await apiClient.post('/api/v1/agenda/blockings', payload);
    return unwrap(response);
  },
  async deleteBlocking(id) {
    const response = await apiClient.delete(`/api/v1/agenda/blockings/${id}`);
    return unwrap(response);
  },
};
