import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

const endpoints = {
  list: '/clients',
  reservations: (id) => `/clients/${id}/reservas`,
  update: (id) => `/clients/${id}`,
  status: (id) => `/clients/${id}/status`,
  password: (id) => `/clients/${id}/password`,
};

export const clientsService = {
  endpoints,
  async listClients(params) {
    const response = await apiClient.get(endpoints.list, { params });
    return unwrap(response);
  },
  async listReservationsByClient(id) {
    const response = await apiClient.get(endpoints.reservations(id));
    return unwrap(response);
  },
  async updateClient(id, payload) {
    const response = await apiClient.put(endpoints.update(id), payload);
    return unwrap(response);
  },
  async updateStatus(id, payload) {
    const response = await apiClient.patch(endpoints.status(id), payload);
    return unwrap(response);
  },
  async updatePassword(id, payload) {
    const response = await apiClient.patch(endpoints.password(id), payload);
    return unwrap(response);
  },
};
