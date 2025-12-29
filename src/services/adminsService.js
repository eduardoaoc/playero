import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const adminsService = {
  async listAdmins() {
    const response = await apiClient.get('/api/v1/admin/admins');
    return unwrap(response);
  },
  async createAdmin(payload) {
    const response = await apiClient.post('/api/v1/admin/admins', payload);
    return unwrap(response);
  },
  async updateAdmin(id, payload) {
    const response = await apiClient.put(`/api/v1/admin/admins/${id}`, payload);
    return unwrap(response);
  },
  async deleteAdmin(id) {
    const response = await apiClient.delete(`/api/v1/admin/admins/${id}`);
    return unwrap(response);
  },
  async updateStatus(id, payload) {
    const response = await apiClient.patch(`/api/v1/admin/admins/${id}/status`, payload);
    return unwrap(response);
  },
};
