import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const homeService = {
  async getHome() {
    const response = await apiClient.get('/api/v1/home');
    return unwrap(response);
  },
  async updateHome(payload) {
    const response = await apiClient.put('/api/v1/admin/home', payload);
    return unwrap(response);
  },
};
