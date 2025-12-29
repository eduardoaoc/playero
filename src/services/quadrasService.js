import apiClient from './apiClient';

const unwrap = (response) => response?.data ?? response;

const isActiveQuadra = (quadra) => {
  if (quadra?.ativa !== undefined) {
    return Boolean(quadra.ativa);
  }
  if (quadra?.ativo !== undefined) {
    return Boolean(quadra.ativo);
  }
  if (quadra?.status) {
    return ['ativa', 'ativo', 'disponivel', 'livre'].includes(String(quadra.status).toLowerCase());
  }
  return true;
};

export const normalizeQuadras = (payload, { includeInactive = false } = {}) => {
  const raw =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.quadras) && payload.quadras) ||
    (Array.isArray(payload?.data?.data) && payload.data.data) ||
    [];

  return raw
    .filter((quadra) => (includeInactive ? true : isActiveQuadra(quadra)))
    .map((quadra, index) => {
      const quadraId = quadra?.id ?? quadra?.quadra_id;
      if (quadraId === undefined || quadraId === null) {
        return null;
      }

      const statusValue =
        quadra?.status ??
        (quadra?.ativa === false || quadra?.ativo === false ? 'Manutencao' : 'Livre');

      return {
        id: quadraId,
        name: quadra?.nome ?? quadra?.name ?? `Quadra ${quadraId ?? index + 1}`,
        type: quadra?.tipo ?? quadra?.modalidade ?? quadra?.categoria ?? quadra?.type ?? 'Quadra',
        description: quadra?.descricao ?? quadra?.description ?? quadra?.texto ?? '',
        imageUrl: quadra?.imagem_url ?? quadra?.image_url ?? quadra?.image ?? quadra?.foto ?? '',
        status: statusValue,
        raw: quadra,
      };
    })
    .filter(Boolean);
};

export const quadrasService = {
  async listQuadras(options = {}) {
    const response = await apiClient.get('/api/v1/quadras');
    return normalizeQuadras(unwrap(response), options);
  },
  async createQuadra(payload) {
    const response = await apiClient.post('/api/v1/quadras', payload);
    return unwrap(response);
  },
  async updateQuadra(id, payload) {
    const response = await apiClient.put(`/api/v1/quadras/${id}`, payload);
    return unwrap(response);
  },
  async deleteQuadra(id) {
    const response = await apiClient.delete(`/api/v1/quadras/${id}`);
    return unwrap(response);
  },
  async updateStatus(id, payload) {
    const response = await apiClient.patch(`/api/v1/quadras/${id}/status`, payload);
    return unwrap(response);
  },
};
