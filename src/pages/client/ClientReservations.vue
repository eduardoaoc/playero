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
        <SectionHeader title="Minhas reservas" subtitle="Acompanhe status e pagamentos em tempo real.">
          <template #actions>
            <button class="dash-action dash-action--primary" type="button" @click="goToReserva">
              <DashboardIcon name="calendar-plus" />
              Fazer uma reserva
            </button>
          </template>
        </SectionHeader>

        <div class="tabs-wrap">
          <button
            v-for="tab in statusTabs"
            :key="tab.key"
            type="button"
            class="tab-chip"
            :class="{ 'is-active': activeTab === tab.key }"
            @click="setTab(tab.key)"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tabCounts[tab.key] ?? 0 }}</span>
          </button>
        </div>

        <EmptyStateCard
          v-if="!isLoading && !filteredReservations.length"
          title="Nada encontrado"
          :description="emptyDescription"
          icon="calendar"
          :action-label="emptyActionLabel"
          :action-callback="emptyAction"
        />

        <div v-else class="table-card">
          <div class="table-header">
            <div>
              <h3 class="table-title">Reservas encontradas</h3>
              <p class="table-subtitle">Veja detalhes e atualizações recentes.</p>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="client-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Quadra</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>A\u00e7\u00f5es</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="6" class="table-empty">Carregando reservas...</td>
                </tr>
                <tr v-else-if="!paginatedReservations.length">
                  <td colspan="6" class="table-empty">Nenhuma reserva encontrada para este filtro.</td>
                </tr>
                <tr v-for="reservation in paginatedReservations" :key="reservation.id">
                  <td>{{ formatShortDate(reservation.date) }}</td>
                  <td>{{ reservation.time }}</td>
                  <td>{{ reservation.court }}</td>
                  <td>
                    <span class="status-pill" :class="statusPillClass(reservation.status)">
                      {{ statusLabel(reservation.status) }}
                    </span>
                  </td>
                  <td>
                    <span class="payment-pill">{{ reservation.payment }}</span>
                  </td>
                  <td>
                    <button class="action-button" type="button" @click="openDetails(reservation)">
                      <DashboardIcon name="arrow-up-right" :size="16" />
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <span class="table-range">{{ paginationSummary }}</span>
            <div class="pagination">
              <button
                class="pagination-button"
                type="button"
                :disabled="pagination.page === 1"
                @click="changePage(pagination.page - 1)"
              >
                Anterior
              </button>
              <button
                v-for="page in pageNumbers"
                :key="page"
                class="pagination-button"
                :class="{ 'is-active': page === pagination.page }"
                type="button"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
              <button
                class="pagination-button"
                type="button"
                :disabled="pagination.page === totalPages"
                @click="changePage(pagination.page + 1)"
              >
                Pr\u00f3ximo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="selectedReservation" class="modal-overlay" @click="closeDetails">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Detalhes da reserva</p>
            <h3 class="modal-title">{{ selectedReservation.court }}</h3>
          </div>
          <button class="modal-close" type="button" @click="closeDetails">
            <DashboardIcon name="x" />
          </button>
        </header>

        <div class="modal-body">
          <div class="modal-grid">
            <div class="modal-item">
              <span class="modal-label">Data</span>
              <strong class="modal-value">{{ formatShortDate(selectedReservation.date) }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Hora</span>
              <strong class="modal-value">{{ selectedReservation.time }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Status</span>
              <span class="status-pill" :class="statusPillClass(selectedReservation.status)">
                {{ statusLabel(selectedReservation.status) }}
              </span>
            </div>
            <div class="modal-item">
              <span class="modal-label">Pagamento</span>
              <strong class="modal-value">{{ selectedReservation.payment }}</strong>
            </div>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeDetails">
              Fechar
            </button>
            <button
              v-if="canRequestRefund(selectedReservation)"
              class="dash-action"
              type="button"
              @click="handleRefund(selectedReservation)"
            >
              Solicitar reembolso
            </button>
            <button
              v-if="canCancel(selectedReservation)"
              class="dash-action dash-action--danger"
              type="button"
              @click="handleCancel(selectedReservation)"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '../../components/Sidebar.vue';
import SectionHeader from '../../components/SectionHeader.vue';
import EmptyStateCard from '../../components/EmptyStateCard.vue';
import MobileNav from '../../components/MobileNav.vue';
import DashboardIcon from '../../components/DashboardIcon.vue';
import api from '../../services/apiClient';
import { useAuth } from '../../stores/auth';
import { useToast } from '../../composables/useToast';
import { useAlert } from '../../composables/useAlert';

const router = useRouter();
const route = useRoute();
const auth = useAuth();
const toast = useToast();
const { showConfirm } = useAlert();

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
const selectedReservation = ref(null);
const isLoading = ref(false);

const pagination = ref({
  page: 1,
  perPage: 10,
});

const statusTabs = [
  { key: 'upcoming', label: 'Pr\u00f3ximas' },
  { key: 'paid', label: 'Pagas' },
  { key: 'canceled', label: 'Canceladas' },
  { key: 'past', label: 'Passadas' },
];

const activeTab = ref('upcoming');
const allowedTabKeys = new Set(statusTabs.map((tab) => tab.key));

const normalizeTabKey = (value) => {
  const key = String(value ?? '').toLowerCase();
  if (allowedTabKeys.has(key)) {
    return key;
  }
  const map = {
    proxima: 'upcoming',
    proximas: 'upcoming',
    paga: 'paid',
    pagas: 'paid',
    cancelada: 'canceled',
    canceladas: 'canceled',
    passada: 'past',
    passadas: 'past',
  };
  return map[key] || '';
};

const applyTabFromRoute = () => {
  const tabKey = normalizeTabKey(route.query.tab);
  if (tabKey && tabKey !== activeTab.value) {
    activeTab.value = tabKey;
  }
};

const mockReservations = [
  {
    id: 1,
    date: '2025-01-10',
    time: '19:00',
    court: 'Quadra Premium',
    status: 'paga',
    payment: 'Pago',
    cancelable: true,
    refundable: true,
  },
  {
    id: 2,
    date: '2025-01-12',
    time: '18:30',
    court: 'Quadra 2',
    status: 'pendente',
    payment: 'Pendente',
    cancelable: true,
  },
  {
    id: 3,
    date: '2024-12-18',
    time: '20:00',
    court: 'Quadra 1',
    status: 'passada',
    payment: 'Pago',
    cancelable: false,
  },
  {
    id: 4,
    date: '2024-12-22',
    time: '16:00',
    court: 'Quadra 3',
    status: 'cancelada',
    payment: 'Estornado',
    cancelable: false,
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

const resolveStatusKey = (item, dateKey) => {
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

  if (dateKey) {
    const today = new Date();
    const todayKey = resolveDateKey(today);
    if (dateKey < todayKey) {
      return 'passada';
    }
  }

  return 'proxima';
};

const normalizeReservation = (item, index) => {
  const dateKey = resolveDateKey(item?.date ?? item?.data ?? item?.dia ?? item?.data_reserva ?? item?.start_date);
  const status = resolveStatusKey(item, dateKey);
  return {
    id: item?.id ?? item?.uuid ?? index,
    date: dateKey,
    time: resolveTime(item?.time ?? item?.hora ?? item?.horario ?? item?.start_time),
    court:
      item?.court ??
      item?.quadra ??
      item?.quadra_nome ??
      item?.quadra_name ??
      item?.quadra?.nome ??
      'Quadra',
    status,
    payment:
      item?.payment ??
      item?.pagamento ??
      item?.payment_status ??
      (status === 'paga' ? 'Pago' : status === 'pendente' ? 'Pendente' : '---'),
    cancelable: item?.cancelable ?? item?.cancelavel ?? true,
    refundable: item?.refundable ?? item?.reembolsavel ?? status === 'paga',
  };
};

const tabKeyFor = (reservation) => {
  if (reservation.status === 'cancelada') {
    return 'canceled';
  }
  if (reservation.status === 'passada') {
    return 'past';
  }
  if (reservation.status === 'paga') {
    return 'paid';
  }
  return 'upcoming';
};

const filteredReservations = computed(() =>
  reservations.value.filter((reservation) => tabKeyFor(reservation) === activeTab.value),
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredReservations.value.length / pagination.value.perPage)),
);

const paginatedReservations = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage;
  return filteredReservations.value.slice(start, start + pagination.value.perPage);
});

const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);

const paginationSummary = computed(() => {
  if (!filteredReservations.value.length) {
    return 'Mostrando 0 reservas';
  }
  const start = (pagination.value.page - 1) * pagination.value.perPage + 1;
  const end = Math.min(filteredReservations.value.length, pagination.value.page * pagination.value.perPage);
  return `Mostrando ${start}-${end} de ${filteredReservations.value.length} reservas`;
});

const tabCounts = computed(() =>
  reservations.value.reduce(
    (acc, reservation) => {
      const key = tabKeyFor(reservation);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { upcoming: 0, paid: 0, canceled: 0, past: 0 },
  ),
);

const emptyDescription = computed(() => {
  const map = {
    upcoming: 'Voc\u00ea ainda n\u00e3o possui reservas futuras.',
    paid: 'Nenhuma reserva paga encontrada.',
    canceled: 'Nenhuma reserva cancelada registrada.',
    past: 'Nenhuma reserva passada registrada.',
  };
  return map[activeTab.value] || 'Voc\u00ea ainda n\u00e3o possui reservas.';
});

const emptyActionLabel = computed(() => (activeTab.value === 'upcoming' ? 'Fazer uma reserva' : ''));
const emptyAction = computed(() => (activeTab.value === 'upcoming' ? goToReserva : null));

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
    pendente: 'Pendente / Pr\u00e9-reserva',
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

const changePage = (page) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  pagination.value.page = safePage;
};

const setTab = (key) => {
  activeTab.value = key;
  router.replace({ path: route.path, query: { ...route.query, tab: key } });
};

const openDetails = (reservation) => {
  selectedReservation.value = reservation;
};

const closeDetails = () => {
  selectedReservation.value = null;
};

const canCancel = (reservation) =>
  reservation?.cancelable && !['cancelada', 'passada'].includes(reservation.status);

const canRequestRefund = (reservation) =>
  reservation?.refundable && reservation?.status === 'paga' && reservation?.cancelable;

const handleCancel = async (reservation) => {
  if (!reservation) {
    return;
  }

  const confirmed = await showConfirm({
    type: 'warning',
    title: 'Cancelar reserva',
    message: 'Tem certeza que deseja cancelar esta reserva?',
    confirmText: 'Cancelar',
  });

  if (!confirmed) {
    return;
  }

  if (mockMode) {
    reservations.value = reservations.value.map((item) =>
      item.id === reservation.id ? { ...item, status: 'cancelada', payment: 'Estornado' } : item,
    );
    toast.success('Reserva cancelada com sucesso.');
    closeDetails();
    return;
  }

  try {
    // TODO: integrar endpoint de cancelamento da reserva.
    reservations.value = reservations.value.map((item) =>
      item.id === reservation.id ? { ...item, status: 'cancelada', payment: 'Estornado' } : item,
    );
    toast.success('Reserva cancelada com sucesso.');
    closeDetails();
  } catch {
    toast.error('N\u00e3o foi poss\u00edvel cancelar a reserva.');
  }
};

const handleRefund = () => {
  toast.info('Solicita\u00e7\u00e3o de reembolso registrada.');
};

const goToReserva = () => {
  router.push('/reservar');
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

watch(
  () => activeTab.value,
  () => {
    pagination.value.page = 1;
  },
);

watch(
  () => route.query.tab,
  () => {
    applyTabFromRoute();
  },
);

watch(
  () => filteredReservations.value.length,
  () => {
    if (pagination.value.page > totalPages.value) {
      pagination.value.page = totalPages.value;
    }
  },
);

onMounted(() => {
  loadReservations();
  applyTabFromRoute();
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
  gap: 22px;
}

.tabs-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab-chip {
  border-radius: 999px;
  border: 1px solid var(--dash-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--dash-muted);
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.tab-chip.is-active {
  background: rgba(255, 122, 0, 0.16);
  color: var(--dash-text);
  border-color: rgba(255, 122, 0, 0.35);
}

.tab-count {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--dash-text);
}

.table-card {
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--dash-shadow);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.table-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.table-subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--dash-muted);
}

.table-wrapper {
  overflow-x: auto;
}

.client-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.client-table th,
.client-table td {
  text-align: left;
  padding: 14px 12px;
  font-size: 0.9rem;
  color: var(--dash-text);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  vertical-align: middle;
}

.client-table th {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--dash-muted);
  font-weight: 700;
}

.table-empty {
  text-align: center;
  padding: 24px;
  color: var(--dash-muted);
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

.payment-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--dash-muted);
  font-weight: 600;
  font-size: 0.8rem;
}

.action-button {
  border-radius: 12px;
  border: 1px solid var(--dash-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--dash-text);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.table-range {
  font-size: 0.85rem;
  color: var(--dash-muted);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-button {
  border-radius: 999px;
  border: 1px solid var(--dash-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--dash-text);
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.pagination-button.is-active {
  background: var(--dash-primary);
  color: #0b0d10;
  border-color: transparent;
}

.pagination-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.dash-action--danger {
  background: var(--dash-danger-soft);
  color: var(--dash-danger);
  border-color: transparent;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 110;
}

.modal-card {
  width: 100%;
  max-width: 720px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  border-radius: var(--dash-radius-lg);
  box-shadow: var(--dash-shadow);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted);
  font-weight: 700;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dash-text);
}

.modal-close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--dash-border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--dash-muted);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.modal-body {
  padding: 16px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.modal-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted);
  font-weight: 700;
}

.modal-value {
  font-size: 0.95rem;
  color: var(--dash-text);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
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

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>


