import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const normalizeHorarios = (payload) => {
  const raw =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.horarios) && payload.horarios) ||
    (Array.isArray(payload?.data?.horarios) && payload.data.horarios) ||
    [];

  const isTruthy = (value) =>
    value === true ||
    value === 1 ||
    String(value).toLowerCase() === 'true' ||
    String(value) === '1';

  const resolveDisponivel = (item) => {
    if (item?.disponivel !== undefined) {
      return isTruthy(item?.disponivel);
    }
    if (item?.available !== undefined) {
      return isTruthy(item?.available);
    }
    if (item?.is_available !== undefined) {
      return isTruthy(item?.is_available);
    }
    if (item?.isAvailable !== undefined) {
      return isTruthy(item?.isAvailable);
    }
    if (item?.status !== undefined) {
      return ['disponivel', 'available'].includes(String(item?.status).toLowerCase());
    }
    return true;
  };

  return raw
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `${item}-${index}`,
          horaInicio: item,
          horaFim: '',
          disponivel: true,
        };
      }
      return {
        id: item?.id ?? `${item?.hora_inicio ?? item?.inicio ?? item?.start ?? index}-${index}`,
        horaInicio: item?.hora_inicio ?? item?.inicio ?? item?.start ?? item?.hora ?? '',
        horaFim: item?.hora_fim ?? item?.fim ?? item?.end ?? '',
        disponivel: resolveDisponivel(item),
      };
    })
    .filter((item) => item.horaInicio && item.disponivel);
};

export const reservasService = {
  async getDisponibilidade(quadraId, data) {
    const response = await apiClient.get('/api/v1/disponibilidade', {
      params: {
        quadra_id: quadraId,
        data,
      },
    });
    return normalizeHorarios(unwrap(response));
  },
  async createReserva(payload) {
    const response = await apiClient.post('/api/v1/reservas', payload);
    return unwrap(response);
  },
  async listReservas(params) {
    const response = await apiClient.get('/api/v1/reservas', { params });
    return unwrap(response);
  },
  async getMinhasReservas() {
    const response = await apiClient.get('/api/v1/minhas-reservas');
    return unwrap(response);
  },
  async cancelarReserva(id) {
    const response = await apiClient.post(`/api/v1/reservas/${id}/cancelar`);
    return unwrap(response);
  },
  async listAdminReservas() {
    const response = await apiClient.get('/api/v1/admin/reservas');
    return unwrap(response);
  },
  async createAdminReserva(payload) {
    const response = await apiClient.post('/api/v1/admin/reservas', payload);
    return unwrap(response);
  },
  async cancelarAdminReserva(id) {
    const response = await apiClient.post(`/api/v1/admin/reservas/${id}/cancelar`);
    return unwrap(response);
  },
};
