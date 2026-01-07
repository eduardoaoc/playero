<template>
  <div class="dashboard-shell client-shell">
    <Sidebar
      mode="client"
      :brand="brand"
      general-label="CLIENTE"
      support-label="SUPORTE"
      :general-items="generalItems"
      :support-items="supportItems"
      :user="sidebarUser"
    />

    <main class="dashboard-main">
      <div class="dashboard-content">
        <SectionHeader
          title="Dashboard do cliente"
          subtitle="Resumo das suas reservas e solicitações."
        >
          <template #actions>
            <button class="dash-action dash-action--primary" type="button" @click="goToReserva">
              <DashboardIcon name="calendar-plus" />
              Fazer reserva
            </button>
          </template>
        </SectionHeader>

        <section class="client-kpi-grid">
          <button
            v-for="kpi in kpis"
            :key="kpi.label"
            class="client-kpi-card client-kpi-card--button"
            type="button"
            @click="goToKpi(kpi)"
          >
            <span class="client-kpi-icon">
              <DashboardIcon :name="kpi.icon" :size="16" />
            </span>
            <span class="client-kpi-text">
              <span class="client-kpi-label">{{ kpi.label }}</span>
              <span class="client-kpi-meta">{{ kpi.meta }}</span>
            </span>
            <span class="client-kpi-count">{{ kpi.value }}</span>
          </button>
        </section>

        <section class="dashboard-section">
          <SectionHeader title="Próxima reserva" subtitle="Seu próximo horário confirmado." />

          <div v-if="nextReservation" class="next-reservation-card">
            <header class="next-reservation-header">
              <div>
                <p class="card-eyebrow">Reserva confirmada</p>
                <h3 class="card-title">{{ nextReservation.court }}</h3>
              </div>
              <span class="status-pill" :class="statusPillClass(nextReservation.status)">
                {{ statusLabel(nextReservation.status) }}
              </span>
            </header>

            <div class="next-reservation-meta">
              <div>
                <span class="meta-label">Data</span>
                <strong class="meta-value">{{ formatShortDate(nextReservation.date) }}</strong>
              </div>
              <div>
                <span class="meta-label">Hora</span>
                <strong class="meta-value">{{ nextReservation.time }}</strong>
              </div>
              <div>
                <span class="meta-label">Pagamento</span>
                <strong class="meta-value">{{ nextReservation.payment }}</strong>
              </div>
            </div>

            <button class="dash-action dash-action--ghost" type="button" @click="goToReservas">
              Ver detalhes
            </button>
          </div>

          <EmptyStateCard
            v-else
            title="Nada encontrado"
            description="Você ainda não possui reservas."
            icon="calendar"
            action-label="Fazer uma reserva"
            :action-callback="goToReserva"
          />
        </section>
      </div>
    </main>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '../../components/Sidebar.vue';
import SectionHeader from '../../components/SectionHeader.vue';
import EmptyStateCard from '../../components/EmptyStateCard.vue';
import MobileNav from '../../components/MobileNav.vue';
import DashboardIcon from '../../components/DashboardIcon.vue';
import api from '../../services/apiClient';
import { useAuth } from '../../stores/auth';
import { useToast } from '../../composables/useToast';

const router = useRouter();
const route = useRoute();
const auth = useAuth();
const toast = useToast();

const mockMode = import.meta.env.VITE_MOCK_MODE === 'true';

const brand = computed(() => ({
  name: 'Playero',
  role: 'Cliente',
}));

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  const firstName = user.first_name ?? user.nome ?? user.name ?? '';
  const lastName = user.last_name ?? user.sobrenome ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return {
    name: fullName || 'Cliente',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Cliente',
  };
});

const generalItems = computed(() => [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    href: '/cliente/dashboard',
    active: route.path === '/cliente/dashboard',
  },
  {
    label: 'Minhas Reservas',
    icon: 'calendar-check',
    href: '/cliente/reservas',
    active: route.path === '/cliente/reservas',
  },
  {
    label: 'Meu Perfil',
    icon: 'user',
    href: '/cliente/perfil',
    active: route.path === '/cliente/perfil',
  },
]);

const supportItems = computed(() => [
  {
    label: 'Suporte',
    icon: 'clipboard',
    href: '/cliente/suporte',
    active: route.path === '/cliente/suporte',
  },
]);

const mobileNav = computed(() => [
  { label: 'Dashboard', icon: 'dashboard', href: '/cliente/dashboard', active: route.path === '/cliente/dashboard' },
  { label: 'Reservas', icon: 'calendar-check', href: '/cliente/reservas', active: route.path === '/cliente/reservas' },
  { label: 'Perfil', icon: 'user', href: '/cliente/perfil', active: route.path === '/cliente/perfil' },
  { label: 'Suporte', icon: 'clipboard', href: '/cliente/suporte', active: route.path === '/cliente/suporte' },
]);

const reservations = ref([]);
const tickets = ref([]);
const isLoading = ref(false);

const mockReservations = [
  {
    id: 1,
    date: '2025-01-10',
    time: '19:00',
    court: 'Quadra Premium',
    status: 'paga',
    payment: 'Pago',
    cancelable: true,
  },
  {
    id: 2,
    date: '2025-01-15',
    time: '21:30',
    court: 'Quadra 2',
    status: 'pendente',
    payment: 'Pendente',
    cancelable: true,
  },
];

const mockTickets = [
  {
    id: 1,
    subject: 'D\u00favida sobre hor\u00e1rio',
    status: 'aberto',
    createdAt: '2025-01-02T10:20:00Z',
  },
  {
    id: 2,
    subject: 'Reagendar reserva',
    status: 'em_andamento',
    createdAt: '2025-01-04T15:10:00Z',
  },
];

const resolveDateKey = (value) => {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
    const [day, month, year] = raw.split('/');
    return `${year}-${month}-${day}`;
  }
  return '';
};

const resolveTime = (value) => {
  if (!value) {
    return '--:--';
  }
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  return String(value);
};

const resolveStatusKey = (item) => {
  const rawStatus = String(item?.status ?? item?.situacao ?? item?.state ?? '').toLowerCase();
  const rawPayment = String(item?.payment ?? item?.pagamento ?? item?.payment_status ?? '').toLowerCase();

  if (rawStatus.includes('cancel')) {
    return 'cancelada';
  }
  if (rawStatus.includes('passad') || rawStatus.includes('final') || rawStatus.includes('conclu')) {
    return 'passada';
  }
  if (rawStatus.includes('paga') || rawPayment.includes('paga')) {
    return 'paga';
  }
  if (rawStatus.includes('pend') || rawStatus.includes('pre')) {
    return 'pendente';
  }
  if (rawStatus.includes('prox') || rawStatus.includes('confirm')) {
    return 'proxima';
  }
  return 'proxima';
};

const normalizeReservation = (item, index) => {
  const dateKey = resolveDateKey(item?.date ?? item?.data ?? item?.dia ?? item?.data_reserva ?? item?.start_date);
  const time = resolveTime(item?.time ?? item?.hora ?? item?.horario ?? item?.start_time);
  const court =
    item?.court ??
    item?.quadra ??
    item?.quadra_nome ??
    item?.quadra_name ??
    item?.quadra?.nome ??
    'Quadra';
  const status = resolveStatusKey(item);
  const payment =
    item?.payment ??
    item?.pagamento ??
    item?.payment_status ??
    (status === 'paga' ? 'Pago' : status === 'pendente' ? 'Pendente' : '---');

  return {
    id: item?.id ?? item?.uuid ?? index,
    date: dateKey,
    time,
    court,
    status,
    payment,
    cancelable: item?.cancelable ?? item?.cancelavel ?? true,
  };
};

const normalizeTicket = (item, index) => {
  const statusRaw = String(item?.status ?? item?.situacao ?? '').toLowerCase();
  let status = 'aberto';
  if (statusRaw.includes('and')) {
    status = 'em_andamento';
  } else if (statusRaw.includes('fech') || statusRaw.includes('resol')) {
    status = 'fechado';
  }
  return {
    id: item?.id ?? item?.uuid ?? index,
    subject: item?.subject ?? item?.assunto ?? 'Sem assunto',
    status,
    createdAt: item?.created_at ?? item?.criado_em ?? item?.createdAt ?? '',
  };
};

const loadReservations = async () => {
  isLoading.value = true;
  if (mockMode) {
    reservations.value = mockReservations.map(normalizeReservation);
    isLoading.value = false;
    return;
  }

  try {
    const response = await api.get('/api/v1/my-reservas');
    const payload = response?.data ?? response;
    const data = payload?.data ?? payload ?? [];
    reservations.value = Array.isArray(data) ? data.map(normalizeReservation) : [];
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      reservations.value = mockReservations.map(normalizeReservation);
      toast.info('Reservas em modo de demonstra\u00e7\u00e3o.');
      return;
    }
    toast.error('N\u00e3o foi poss\u00edvel carregar suas reservas.');
  } finally {
    isLoading.value = false;
  }
};

const loadTickets = async () => {
  if (mockMode) {
    tickets.value = mockTickets.map(normalizeTicket);
    return;
  }

  try {
    const response = await api.get('/api/v1/my-tickets');
    const payload = response?.data ?? response;
    const data = payload?.data ?? payload ?? [];
    tickets.value = Array.isArray(data) ? data.map(normalizeTicket) : [];
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      tickets.value = mockTickets.map(normalizeTicket);
      toast.info('Tickets em modo de demonstra\u00e7\u00e3o.');
      return;
    }
    toast.error('N\u00e3o foi poss\u00edvel carregar seus tickets.');
  }
};

const isUpcoming = (reservation) =>
  reservation.status !== 'cancelada' && reservation.status !== 'passada';

const sortedReservations = computed(() =>
  [...reservations.value].sort((a, b) => {
    const aKey = `${a.date || ''} ${a.time || ''}`.trim();
    const bKey = `${b.date || ''} ${b.time || ''}`.trim();
    return aKey.localeCompare(bKey);
  }),
);

const upcomingReservations = computed(() =>
  sortedReservations.value.filter((reservation) => isUpcoming(reservation)),
);

const nextReservation = computed(() => upcomingReservations.value[0] || null);

const ticketsOpenCount = computed(() =>
  tickets.value.filter((ticket) => ticket.status !== 'fechado').length,
);

const paidCount = computed(
  () => reservations.value.filter((reservation) => reservation.status === 'paga').length,
);

const upcomingCount = computed(() => upcomingReservations.value.length);

const kpis = computed(() => [
  {
    label: 'Pr\u00f3ximas reservas',
    value: upcomingCount.value,
    meta: 'Agendadas',
    icon: 'calendar',
    route: { path: '/cliente/reservas', query: { tab: 'upcoming' } },
  },
  {
    label: 'Reservas pagas',
    value: paidCount.value,
    meta: 'Confirmadas',
    icon: 'check',
    route: { path: '/cliente/reservas', query: { tab: 'paid' } },
  },
  {
    label: 'Tickets abertos',
    value: ticketsOpenCount.value,
    meta: 'Suporte',
    icon: 'clipboard',
    route: { path: '/cliente/suporte' },
  },
]);

const formatShortDate = (value) => {
  if (!value) {
    return '--/--';
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const statusLabel = (status) => {
  const map = {
    paga: 'Pago',
    pendente: 'Pendente',
    cancelada: 'Cancelada',
    passada: 'Passada',
    proxima: 'Pr\u00f3xima',
  };
  return map[status] || status;
};

const statusPillClass = (status) => {
  const map = {
    paga: 'status-pill--success',
    pendente: 'status-pill--warning',
    cancelada: 'status-pill--danger',
    passada: 'status-pill--neutral',
    proxima: 'status-pill--info',
  };
  return map[status] || 'status-pill--neutral';
};

const goToReserva = () => {
  router.push('/reservar');
};

const goToReservas = () => {
  router.push('/cliente/reservas');
};

const goToKpi = (kpi) => {
  if (!kpi?.route) {
    return;
  }
  router.push(kpi.route);
};

onMounted(() => {
  loadReservations();
  loadTickets();
});
</script>

<style scoped>
.client-shell {
  min-height: 100vh;
  background: #0b0d10;
  color: #f7f7f8;
  font-family: 'Sora', 'Space Grotesk', system-ui, sans-serif;
  --dash-bg: #0b0d10;
  --dash-surface: #141418;
  --dash-surface-soft: #15151b;
  --dash-soft: #1a1a1f;
  --dash-border: rgba(255, 255, 255, 0.1);
  --dash-text: #f7f7f8;
  --dash-muted: #b5b5b5;
  --dash-primary: #ff7a00;
  --dash-primary-soft: rgba(255, 122, 0, 0.18);
  --dash-success: #4caf50;
  --dash-success-soft: rgba(76, 175, 80, 0.2);
  --dash-warning: #ffc107;
  --dash-warning-soft: rgba(255, 193, 7, 0.2);
  --dash-danger: #ff5f6b;
  --dash-danger-soft: rgba(255, 95, 107, 0.2);
  --dash-info: #1976d2;
  --dash-shadow: 0 30px 70px -50px rgba(0, 0, 0, 0.7);
  --dash-radius: 18px;
  --dash-radius-lg: 24px;
  --dash-sidebar-width: 280px;
  --dash-mobile-nav-height: 72px;
}

.dashboard-shell {
  min-height: 100vh;
  background: var(--dash-bg);
  color: var(--dash-text);
}

.dashboard-main {
  margin-left: var(--dash-sidebar-width);
  padding-top: 32px;
  padding-bottom: 40px;
  min-height: 100vh;
}

.dashboard-content {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.client-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.client-kpi-card {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--dash-border);
  background: var(--dash-surface);
  box-shadow: 0 18px 40px -34px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-kpi-card--button {
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.client-kpi-card--button:focus-visible {
  outline: 2px solid rgba(255, 122, 0, 0.55);
  outline-offset: 3px;
}

.client-kpi-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.client-kpi-label {
  font-size: 0.78rem;
  color: var(--dash-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-kpi-icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  color: var(--dash-primary);
}

.client-kpi-meta {
  font-size: 0.7rem;
  color: var(--dash-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-kpi-count {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--dash-primary);
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.next-reservation-card {
  padding: 18px;
  border-radius: var(--dash-radius-lg);
  border: 1px solid var(--dash-border);
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next-reservation-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted);
  font-weight: 700;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dash-text);
}

.next-reservation-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.meta-label {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted);
  font-weight: 700;
}

.meta-value {
  display: block;
  margin-top: 6px;
  font-size: 0.95rem;
  font-weight: 600;
}

.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-pill--success {
  background: var(--dash-success-soft);
  color: var(--dash-success);
}

.status-pill--warning {
  background: var(--dash-warning-soft);
  color: var(--dash-warning);
}

.status-pill--danger {
  background: var(--dash-danger-soft);
  color: var(--dash-danger);
}

.status-pill--neutral {
  background: rgba(255, 255, 255, 0.08);
  color: var(--dash-muted);
}

.status-pill--info {
  background: rgba(25, 118, 210, 0.2);
  color: #88b7ff;
}

.dash-action {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--dash-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--dash-text);
  cursor: pointer;
}

.dash-action--primary {
  background: var(--dash-primary);
  color: #0b0d10;
  border-color: transparent;
  box-shadow: 0 18px 40px -28px rgba(255, 122, 0, 0.6);
}

.dash-action--ghost {
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 1200px) {
  .client-kpi-grid {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }
}

@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: 0;
    padding-top: 24px;
  }

  .dashboard-content {
    padding: 0 24px 60px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding-top: 24px;
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .client-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .next-reservation-meta {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .client-kpi-meta {
    display: none;
  }
}

@media (max-width: 360px) {
  .client-kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>


