const endpoints = {
  list: '/clients',
  reservations: (id) => `/clients/${id}/reservas`,
  update: (id) => `/clients/${id}`,
  status: (id) => `/clients/${id}/status`,
  password: (id) => `/clients/${id}/password`,
};

const mockClients = [
  {
    id: 101,
    name: 'Ana Souza',
    email: 'ana.souza@playero.com',
    phone: '(11) 98765-4321',
    createdAt: '2024-02-14',
    reservasTotal: 18,
    status: 'ativo',
  },
  {
    id: 102,
    name: 'Bruno Oliveira',
    email: 'bruno.oliveira@playero.com',
    phone: '(21) 99877-2233',
    createdAt: '2024-03-02',
    reservasTotal: 9,
    status: 'ativo',
  },
  {
    id: 103,
    name: 'Carla Menezes',
    email: 'carla.menezes@playero.com',
    phone: '(31) 99111-8899',
    createdAt: '2024-03-18',
    reservasTotal: 4,
    status: 'bloqueado',
  },
  {
    id: 104,
    name: 'Diego Alves',
    email: 'diego.alves@playero.com',
    phone: '(41) 98812-5544',
    createdAt: '2024-04-05',
    reservasTotal: 22,
    status: 'ativo',
  },
  {
    id: 105,
    name: 'Elisa Duarte',
    email: 'elisa.duarte@playero.com',
    phone: '(51) 97770-4433',
    createdAt: '2024-05-09',
    reservasTotal: 7,
    status: 'ativo',
  },
  {
    id: 106,
    name: 'Felipe Ramos',
    email: 'felipe.ramos@playero.com',
    phone: '(61) 98888-2211',
    createdAt: '2024-05-22',
    reservasTotal: 2,
    status: 'ativo',
  },
  {
    id: 107,
    name: 'Gisele Martins',
    email: 'gisele.martins@playero.com',
    phone: '(71) 98444-9090',
    createdAt: '2024-06-01',
    reservasTotal: 14,
    status: 'ativo',
  },
  {
    id: 108,
    name: 'Henrique Lopes',
    email: 'henrique.lopes@playero.com',
    phone: '(81) 98123-4567',
    createdAt: '2024-06-15',
    reservasTotal: 5,
    status: 'bloqueado',
  },
  {
    id: 109,
    name: 'Isabela Costa',
    email: 'isabela.costa@playero.com',
    phone: '(11) 97654-3322',
    createdAt: '2024-07-02',
    reservasTotal: 11,
    status: 'ativo',
  },
  {
    id: 110,
    name: 'Joao Paes',
    email: 'joao.paes@playero.com',
    phone: '(19) 97000-7788',
    createdAt: '2024-07-22',
    reservasTotal: 6,
    status: 'ativo',
  },
];

const simulate = (payload) => Promise.resolve({ data: payload });

export const clientsService = {
  endpoints,
  async listClients() {
    return simulate(mockClients);
  },
  async listReservationsByClient() {
    return simulate([]);
  },
  async updateClient(id, payload) {
    return simulate({ id, ...payload });
  },
  async updateStatus(id, payload) {
    return simulate({ id, ...payload });
  },
  async updatePassword(id, payload) {
    return simulate({ id, ...payload });
  },
};
