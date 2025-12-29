import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const adminDashboardService = {
  async getDashboard() {
    const response = await apiClient.get('/api/v1/admin/dashboard');
    return unwrap(response);
  },
};
