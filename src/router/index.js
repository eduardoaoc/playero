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
import Eventos from '../pages/Eventos.vue';
import clientRoutes from './client.routes';
import { useAuth } from '../stores/auth';

const ADMIN_ROLES = ['admin', 'super_admin'];

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
    path: '/reservas',
    name: 'reservas',
    component: Reserva,
    meta: { public: true },
    alias: '/reservar',
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/clientes',
    name: 'admin-clientes',
    component: ClientesDashboard,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/quadras',
    name: 'admin-quadras',
    component: Quadras,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/reservas',
    name: 'admin-reservas',
    component: ReservasAdmin,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/administradores',
    name: 'admin-administradores',
    component: Administradores,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/agenda',
    name: 'admin-agenda',
    component: Agenda,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  {
    path: '/admin/eventos',
    name: 'admin-eventos',
    component: Eventos,
    meta: { requiresAuth: true, roles: ADMIN_ROLES },
  },
  ...clientRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const normalizeRole = (value) => {
  const raw = (value ?? '').toString().trim().toLowerCase();
  if (!raw) {
    return '';
  }
  if (raw === 'user' || raw === 'client' || raw === 'cliente') {
    return 'cliente';
  }
  if (raw === 'super-admin' || raw === 'superadmin') {
    return 'super_admin';
  }
  return raw;
};

const resolveRole = (user) => normalizeRole(user?.role ?? user?.perfil ?? user?.tipo ?? '');

const dashboardForRole = (role) => {
  if (role === 'cliente') {
    return '/cliente/dashboard';
  }
  if (ADMIN_ROLES.includes(role)) {
    return '/admin/dashboard';
  }
  return '/login';
};

router.beforeEach(async (to) => {
  const auth = useAuth();
  if (!auth.isInitialized.value) {
    await auth.init();
  }

  const requiredRoles = to.matched.flatMap((record) => record.meta?.roles ?? []);
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth) || requiredRoles.length > 0;

  if (requiresAuth && !auth.isAuthenticated.value) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (requiredRoles.length) {
    let role = resolveRole(auth.user.value);
    if (!role || !auth.isLoaded.value) {
      try {
        const user = await auth.me();
        role = resolveRole(user);
      } catch {
        await auth.logout();
        return {
          name: 'login',
          query: { redirect: to.fullPath },
        };
      }
    }

    if (!role) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      };
    }

    if (!requiredRoles.includes(role)) {
      return { path: dashboardForRole(role) };
    }
  }

  return true;
});

export default router;
