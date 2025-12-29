import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Reserva from '../views/Reserva.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import ClientesDashboard from '../views/ClientesDashboard.vue';
import Quadras from '../views/Quadras.vue';
import ReservasAdmin from '../views/ReservasAdmin.vue';
import Administradores from '../views/Administradores.vue';
import Agenda from '../views/Agenda.vue';
import { useAuth } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/reservar',
    name: 'reservar',
    component: Reserva,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/clientes',
    name: 'admin-clientes',
    component: ClientesDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/quadras',
    name: 'admin-quadras',
    component: Quadras,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/reservas',
    name: 'admin-reservas',
    component: ReservasAdmin,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/administradores',
    name: 'admin-administradores',
    component: Administradores,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/agenda',
    name: 'admin-agenda',
    component: Agenda,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuth();
  if (!auth.isInitialized.value) {
    await auth.init();
  }

  const requiresAuth =
    to.matched.some((record) => record.meta?.requiresAuth) || to.path.startsWith('/admin');

  if (requiresAuth && !auth.isAuthenticated.value) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  return true;
});

export default router;
