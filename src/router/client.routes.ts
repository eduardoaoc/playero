import ClientDashboard from '../pages/client/ClientDashboard.vue';
import ClientReservations from '../pages/client/ClientReservations.vue';
import ClientProfile from '../pages/client/ClientProfile.vue';
import ClientSupport from '../pages/client/ClientSupport.vue';

const CLIENT_ROLES = ['cliente'];

const clientRoutes = [
  {
    path: '/cliente',
    redirect: '/cliente/dashboard',
    meta: { requiresAuth: true, roles: CLIENT_ROLES },
  },
  {
    path: '/cliente/dashboard',
    name: 'client-dashboard',
    component: ClientDashboard,
    meta: { requiresAuth: true, roles: CLIENT_ROLES },
    alias: '/app/dashboard',
  },
  {
    path: '/cliente/reservas',
    name: 'client-reservas',
    component: ClientReservations,
    meta: { requiresAuth: true, roles: CLIENT_ROLES },
    alias: '/app/reservas',
  },
  {
    path: '/cliente/perfil',
    name: 'client-perfil',
    component: ClientProfile,
    meta: { requiresAuth: true, roles: CLIENT_ROLES },
    alias: '/app/perfil',
  },
  {
    path: '/cliente/suporte',
    name: 'client-suporte',
    component: ClientSupport,
    meta: { requiresAuth: true, roles: CLIENT_ROLES },
    alias: '/app/suporte',
  },
  {
    path: '/app',
    redirect: '/cliente/dashboard',
    meta: { requiresAuth: true, roles: CLIENT_ROLES },
  },
];

export default clientRoutes;
