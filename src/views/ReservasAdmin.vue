<template>
  <div class="dashboard-shell">
    <Sidebar
      :brand="brand"
      :general-items="generalItems"
      :support-items="supportItems"
      :quick-action="quickAction"
      :user="sidebarUser"
    />

    <main class="dashboard-main">
      <div class="dashboard-content">
        <section class="dashboard-section">
          <SectionHeader
            title="Painel administrativo"
            subtitle="Controle pagamentos, cancelamentos e horarios em um unico lugar."
          >
            <template #actions>
              <button class="dash-action dash-action--ghost" type="button">
                <DashboardIcon name="clipboard" />
                Exportar
              </button>
              <button
                v-if="canAccess"
                class="dash-action dash-action--primary"
                type="button"
                @click="openCreateModal"
              >
                <DashboardIcon name="calendar-plus" />
                Criar reserva
              </button>
            </template>
          </SectionHeader>

          <div v-if="!canAccess" class="access-card">
            <div class="access-icon">
              <DashboardIcon name="shield" />
            </div>
            <div>
              <h3 class="access-title">Area restrita</h3>
              <p class="access-text">
                Apenas perfis admin ou super_admin podem acessar a gestao completa de reservas.
              </p>
            </div>
          </div>

          <template v-else>
            <div class="table-card">
              <div class="table-header">
                <div>
                  <h3 class="table-title">Todas as reservas</h3>
                  <p class="table-subtitle">Lista completa com status e pagamentos.</p>
                </div>
                <div class="table-legend">
                  <ReservaStatusBadge status="CONFIRMADA" label="Confirmada" />
                  <ReservaStatusBadge status="PRE-RESERVA" label="Pre-reserva" />
                  <ReservaStatusBadge status="CANCELADA" label="Cancelada" />
                </div>
              </div>

              <div class="table-wrapper">
                <table class="reservas-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Quadra</th>
                      <th>Data</th>
                      <th>Horario</th>
                      <th>Status</th>
                      <th>Pagamento</th>
                      <th>Valor</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loading">
                      <td colspan="9" class="table-empty">Carregando reservas...</td>
                    </tr>
                    <tr v-else-if="!reservas.length">
                      <td colspan="9" class="table-empty">Nenhuma reserva encontrada.</td>
                    </tr>
                    <ReservaRow
                      v-for="reserva in paginatedReservas"
                      :key="reserva.id"
                      :reserva="reserva"
                      @view="handleViewDetails"
                    />
                  </tbody>
                </table>
              </div>

              <div v-if="reservas.length" class="table-footer">
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
                    Proximo
                  </button>
                </div>
              </div>
            </div>

            <div class="actions-card">
              <div class="actions-summary">
                <div class="actions-header">
                  <div>
                    <h3 class="table-title">Acoes administrativas</h3>
                    <p class="table-subtitle">Resumo rapido do mes atual.</p>
                  </div>
                  <div class="actions-controls">
                    <label class="actions-filter">
                      <span>Pagamento</span>
                      <select v-model="paymentFilter">
                        <option value="all">Todos</option>
                        <option value="pix">PIX</option>
                        <option value="cartao">Cartao</option>
                      </select>
                    </label>
                    <span class="actions-tag">{{ monthLabel }}</span>
                  </div>
                </div>

                <div class="metrics-grid">
                  <div class="metric-card">
                    <span class="metric-label">Reservas totais</span>
                    <strong class="metric-value">{{ stats.total }}</strong>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Confirmadas</span>
                    <strong class="metric-value metric-value--success">{{ stats.confirmadas }}</strong>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Pre-reservas</span>
                    <strong class="metric-value metric-value--warning">{{ stats.preReservas }}</strong>
                  </div>
                  <div class="metric-card">
                    <span class="metric-label">Canceladas</span>
                    <strong class="metric-value metric-value--danger">{{ stats.canceladas }}</strong>
                  </div>
                  <div class="metric-card metric-card--wide">
                    <span class="metric-label">Pago total</span>
                    <strong class="metric-value">{{ paidSummaryLabel }}</strong>
                    <span class="metric-meta">{{ paidSummaryMeta }}</span>
                  </div>
                </div>

                <div class="revenue-chart">
                  <div class="revenue-chart-header">
                    <div>
                      <h4 class="revenue-title">Grafico de receitas</h4>
                      <p class="revenue-subtitle">Comparativo mensal por metodo de pagamento.</p>
                    </div>
                    <button class="dash-action dash-action--ghost" type="button">
                      Ver relatorio
                    </button>
                  </div>
                  <div class="revenue-bars">
                    <div
                      v-for="(value, index) in chartData"
                      :key="chartMonths[index]"
                      class="revenue-bar"
                    >
                      <span
                        class="revenue-bar-fill"
                        :style="{ height: `${Math.max(8, (value / chartMax) * 100)}%` }"
                      ></span>
                    </div>
                  </div>
                  <div class="revenue-axis">
                    <span v-for="month in chartMonths" :key="month">{{ month }}</span>
                  </div>
                </div>
              </div>

              <div class="admin-actions">
                <button
                  v-for="action in adminActions"
                  :key="action.id"
                  class="admin-action"
                  type="button"
                >
                  <span class="admin-action-icon">
                    <DashboardIcon :name="action.icon" :size="18" />
                  </span>
                  <span class="admin-action-text">
                    <span class="admin-action-title">{{ action.label }}</span>
                    <span class="admin-action-sub">{{ action.helper }}</span>
                  </span>
                </button>
              </div>
            </div>

            <div class="calendar-card">
              <div class="calendar-header">
                <div>
                  <h3 class="table-title">Calendario mensal</h3>
                  <p class="table-subtitle">Distribuicao de reservas por dia.</p>
                </div>
                <label class="calendar-filter">
                  <span>Filtrar por mes</span>
                  <input v-model="calendarMonthFilter" type="month" :max="calendarMonthMax" />
                </label>
              </div>

              <CalendarioReservas
                v-model:monthFilter="calendarMonthFilter"
                :reservas="reservas"
                :month="currentMonth"
                :year="currentYear"
                :show-filter="false"
              />
            </div>
          </template>
        </section>
      </div>
    </main>

    <div v-if="isCreateModalOpen" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Nova reserva</p>
            <h3 class="modal-title">Criar reserva manual</h3>
          </div>
          <button class="modal-close" type="button" @click="closeCreateModal">
            <DashboardIcon name="x" />
          </button>
        </header>

        <form class="modal-body" @submit.prevent="handleCreateReserva">
          <div class="modal-grid">
            <label class="modal-field">
              <span>Cliente</span>
              <input v-model="createForm.cliente" type="text" placeholder="Nome do cliente" />
            </label>
            <label class="modal-field">
              <span>Quadra</span>
              <input v-model="createForm.quadra" type="text" placeholder="Quadra 01" />
            </label>
            <label class="modal-field">
              <span>Data</span>
              <input v-model="createForm.data" type="date" />
            </label>
            <label class="modal-field">
              <span>Horario</span>
              <input v-model="createForm.horario" type="time" />
            </label>
            <label class="modal-field">
              <span>Forma de pagamento</span>
              <select v-model="createForm.pagamento">
                <option value="PIX">PIX</option>
                <option value="Cartao">Cartao</option>
                <option value="---">---</option>
              </select>
            </label>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeCreateModal">
              Cancelar
            </button>
            <button class="dash-action dash-action--primary" type="submit">
              Salvar reserva
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="selectedReserva" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Detalhes da reserva</p>
            <h3 class="modal-title">Reserva #{{ selectedReserva.id }}</h3>
          </div>
          <button class="modal-close" type="button" @click="closeDetailsModal">
            <DashboardIcon name="x" />
          </button>
        </header>

        <div class="modal-body">
          <div class="modal-grid">
            <div class="modal-item">
              <span class="modal-label">Cliente</span>
              <strong class="modal-value">{{ selectedReserva.clienteNome }}</strong>
              <span class="modal-subvalue">{{ selectedReserva.clienteEmail }}</span>
            </div>
            <div class="modal-item">
              <span class="modal-label">Quadra</span>
              <strong class="modal-value">{{ selectedReserva.quadra }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Data</span>
              <strong class="modal-value">{{ selectedReserva.dataLabel }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Horario</span>
              <strong class="modal-value">{{ selectedReserva.horario }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Status</span>
              <ReservaStatusBadge :status="selectedReserva.statusKey" />
            </div>
            <div class="modal-item">
              <span class="modal-label">Pagamento</span>
              <strong class="modal-value">{{ selectedReserva.pagamentoLabel }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Valor</span>
              <strong class="modal-value">{{ selectedReserva.valorLabel }}</strong>
            </div>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeDetailsModal">
              Fechar
            </button>
            <button
              class="dash-action dash-action--ghost"
              type="button"
              :disabled="!canRefundSelected"
              @click="handleRefundReserva(selectedReserva)"
            >
              Devolver pagamento
            </button>
            <button
              class="dash-action dash-action--danger"
              type="button"
              :disabled="!selectedReserva.canCancel"
              @click="handleCancelReserva(selectedReserva)"
            >
              Cancelar reserva
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
import Sidebar from '../components/Sidebar.vue';
import SectionHeader from '../components/SectionHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';
import ReservaRow from '../components/ReservaRow.vue';
import ReservaStatusBadge from '../components/ReservaStatusBadge.vue';
import CalendarioReservas from '../components/CalendarioReservas.vue';
import { reservasService } from '../services/reservasService';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const userRole = 'super_admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');
const canAccess = computed(() => ['admin', 'super_admin'].includes(userRole.toLowerCase()));

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas', active: true },
  { label: 'Administradores', icon: 'shield', href: '/admin/administradores' },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda' },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
];

const generalItems = computed(() =>
  baseGeneralItems.filter((item) => item.label !== 'Administradores' || isSuperAdmin.value),
);

const supportItems = [{ label: 'Configuracoes', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho rapido',
  description: 'Criar uma nova reserva manualmente.',
  buttonLabel: 'Nova reserva',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});


const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const useMock = true;

const formatMonthFilter = (year, monthIndex) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
const calendarMonthFilter = ref(formatMonthFilter(currentYear, currentMonth));
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const maxFutureDate = new Date(todayStart);
maxFutureDate.setFullYear(todayStart.getFullYear() + 1);
const calendarMonthMax = formatMonthFilter(maxFutureDate.getFullYear(), maxFutureDate.getMonth());

const reservas = ref([]);
const loading = ref(false);
const selectedReservaId = ref(null);
const isCreateModalOpen = ref(false);
const pagination = ref({
  page: 1,
  perPage: 10,
});
const paymentFilter = ref('all');

const createForm = ref({
  cliente: '',
  quadra: '',
  data: '',
  horario: '',
  pagamento: 'PIX',
});

const adminActions = [
  { id: 'export', label: 'Exportar CSV', helper: 'Relatorio rapido', icon: 'clipboard' },
  { id: 'pix', label: 'Conciliar PIX', helper: 'Pagamentos pendentes', icon: 'calendar-check' },
  { id: 'bloquear', label: 'Bloquear horario', helper: 'Reserva indisponivel', icon: 'ban' },
  { id: 'relatorio', label: 'Gerar relatorio', helper: 'Resumo administrativo', icon: 'filter' },
];

const chartMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const receitaMensalMap = {
  all: [12000, 18000, 14000, 22000, 28000, 26000, 21000, 24000, 20000, 23000, 19000, 27000],
  pix: [7000, 9000, 8000, 12000, 15000, 14000, 11000, 13000, 10500, 12000, 9800, 15000],
  cartao: [5000, 9000, 6000, 10000, 13000, 12000, 10000, 11000, 9500, 11000, 9200, 12000],
};


const buildDateKey = (year, monthIndex, day) => {
  const monthValue = String(monthIndex + 1).padStart(2, '0');
  const dayValue = String(day).padStart(2, '0');
  return `${year}-${monthValue}-${dayValue}`;
};

const normalizeDateKey = (value) => {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return buildDateKey(value.getFullYear(), value.getMonth(), value.getDate());
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

const formatDate = (value) => {
  if (!value) {
    return '---';
  }
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) {
    return '---';
  }
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  } catch (error) {
    return `R$ ${amount.toFixed(2)}`;
  }
};

const normalizeStatus = (status) => {
  const raw = String(status || '').toLowerCase();
  if (raw.includes('confirm') || raw.includes('paga')) {
    return 'CONFIRMADA';
  }
  if (raw.includes('pre')) {
    return 'PRE-RESERVA';
  }
  if (raw.includes('cancel')) {
    return 'CANCELADA';
  }
  return 'PRE-RESERVA';
};

const statusLabelMap = {
  'PRE-RESERVA': 'Pre-reserva',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

const normalizePagamento = (value) => {
  const raw = String(value || '').toLowerCase();
  if (!raw || raw === '---') {
    return '---';
  }
  if (raw.includes('pix')) {
    return 'PIX';
  }
  if (raw.includes('cart')) {
    return 'Cartao';
  }
  return value;
};

const normalizeReserva = (reserva, index) => {
  const cliente = reserva?.cliente ?? reserva?.client ?? {};
  const clienteNome =
    reserva?.clienteNome ??
    cliente?.nome ??
    cliente?.name ??
    reserva?.nome ??
    reserva?.cliente ??
    `Cliente ${String(index + 1).padStart(2, '0')}`;
  const clienteEmail =
    reserva?.clienteEmail ??
    cliente?.email ??
    reserva?.email ??
    'cliente@playero.com';
  const quadra = reserva?.quadra ?? reserva?.court ?? reserva?.quadra_nome ?? 'Quadra 01';
  const dataISO = normalizeDateKey(reserva?.data || reserva?.data_reserva || reserva?.date) ||
    buildDateKey(currentYear, currentMonth, now.getDate());
  const horaInicio = reserva?.horaInicio ?? reserva?.hora_inicio ?? reserva?.inicio ?? reserva?.start ?? '';
  const horaFim = reserva?.horaFim ?? reserva?.hora_fim ?? reserva?.fim ?? reserva?.end ?? '';
  const horarioRaw = reserva?.horario ?? reserva?.time ?? '';
  const horario = horarioRaw || [horaInicio, horaFim].filter(Boolean).join(' - ') || '---';
  const statusKey = normalizeStatus(reserva?.status ?? reserva?.status_reserva ?? reserva?.state);
  const pagamentoLabel = normalizePagamento(reserva?.pagamento ?? reserva?.forma_pagamento ?? reserva?.payment);
  const valor = Number(reserva?.valor ?? reserva?.price ?? reserva?.total ?? 0);

  return {
    id: reserva?.id ?? reserva?.codigo ?? reserva?.uuid ?? index + 1,
    clienteNome,
    clienteEmail,
    clienteInitial: clienteNome ? clienteNome.charAt(0).toUpperCase() : 'C',
    quadra,
    dataISO,
    dataLabel: formatDate(dataISO),
    horario,
    horaInicio,
    horaFim,
    statusKey,
    statusLabel: statusLabelMap[statusKey] ?? statusKey,
    pagamentoLabel,
    valor,
    valorLabel: formatCurrency(valor),
    canCancel: statusKey !== 'CANCELADA',
  };
};

const mockReservas = [
  {
    id: 1,
    cliente: { nome: 'Mariana Souza', email: 'mariana@playero.com' },
    quadra: 'Quadra 01',
    data: buildDateKey(currentYear, currentMonth, 3),
    horaInicio: '18:00',
    horaFim: '19:00',
    status: 'CONFIRMADA',
    pagamento: 'PIX',
    valor: 120,
  },
  {
    id: 2,
    cliente: { nome: 'Joao Lima', email: 'joao@playero.com' },
    quadra: 'Quadra 02',
    data: buildDateKey(currentYear, currentMonth, 4),
    horaInicio: '19:30',
    horaFim: '20:30',
    status: 'PRE-RESERVA',
    pagamento: 'PIX',
    valor: 140,
  },
  {
    id: 3,
    cliente: { nome: 'Camila Torres', email: 'camila@playero.com' },
    quadra: 'Quadra 03',
    data: buildDateKey(currentYear, currentMonth, 6),
    horaInicio: '20:00',
    horaFim: '21:00',
    status: 'CANCELADA',
    pagamento: '---',
    valor: 0,
  },
  {
    id: 4,
    cliente: { nome: 'Carlos Silva', email: 'carlos@playero.com' },
    quadra: 'Quadra 04',
    data: buildDateKey(currentYear, currentMonth, 7),
    horaInicio: '17:30',
    horaFim: '18:30',
    status: 'CONFIRMADA',
    pagamento: 'Cartao',
    valor: 160,
  },
  {
    id: 5,
    cliente: { nome: 'Natalia Reis', email: 'natalia@playero.com' },
    quadra: 'Quadra 05',
    data: buildDateKey(currentYear, currentMonth, 7),
    horaInicio: '19:00',
    horaFim: '20:00',
    status: 'PRE-RESERVA',
    pagamento: 'PIX',
    valor: 150,
  },
  {
    id: 6,
    cliente: { nome: 'Bruno Alves', email: 'bruno@playero.com' },
    quadra: 'Quadra 06',
    data: buildDateKey(currentYear, currentMonth, 9),
    horaInicio: '21:00',
    horaFim: '22:00',
    status: 'CONFIRMADA',
    pagamento: 'PIX',
    valor: 180,
  },
  {
    id: 7,
    cliente: { nome: 'Laura Gomes', email: 'laura@playero.com' },
    quadra: 'Quadra 02',
    data: buildDateKey(currentYear, currentMonth, 10),
    horaInicio: '18:00',
    horaFim: '19:00',
    status: 'CONFIRMADA',
    pagamento: 'Cartao',
    valor: 130,
  },
  {
    id: 8,
    cliente: { nome: 'Rafael Melo', email: 'rafael@playero.com' },
    quadra: 'Quadra 01',
    data: buildDateKey(currentYear, currentMonth, 12),
    horaInicio: '20:30',
    horaFim: '21:30',
    status: 'PRE-RESERVA',
    pagamento: 'PIX',
    valor: 140,
  },
  {
    id: 9,
    cliente: { nome: 'Isabela Cruz', email: 'isabela@playero.com' },
    quadra: 'Quadra 03',
    data: buildDateKey(currentYear, currentMonth, 15),
    horaInicio: '17:00',
    horaFim: '18:00',
    status: 'CONFIRMADA',
    pagamento: 'PIX',
    valor: 125,
  },
  {
    id: 10,
    cliente: { nome: 'Matheus Rocha', email: 'matheus@playero.com' },
    quadra: 'Quadra 05',
    data: buildDateKey(currentYear, currentMonth, 18),
    horaInicio: '19:00',
    horaFim: '20:00',
    status: 'CONFIRMADA',
    pagamento: 'Cartao',
    valor: 155,
  },
  {
    id: 11,
    cliente: { nome: 'Fernanda Prado', email: 'fernanda@playero.com' },
    quadra: 'Quadra 04',
    data: buildDateKey(currentYear, currentMonth, 20),
    horaInicio: '21:00',
    horaFim: '22:00',
    status: 'PRE-RESERVA',
    pagamento: 'PIX',
    valor: 170,
  },
  {
    id: 12,
    cliente: { nome: 'Diego Castro', email: 'diego@playero.com' },
    quadra: 'Quadra 06',
    data: buildDateKey(currentYear, currentMonth, 22),
    horaInicio: '18:30',
    horaFim: '19:30',
    status: 'CONFIRMADA',
    pagamento: 'PIX',
    valor: 180,
  },
];

const selectedReserva = computed(
  () => reservas.value.find((item) => item.id === selectedReservaId.value) || null,
);

const canRefundSelected = computed(() => {
  const reserva = selectedReserva.value;
  if (!reserva) {
    return false;
  }
  const pagamento = String(reserva.pagamentoLabel || '').toLowerCase();
  return reserva.statusKey !== 'CANCELADA' && pagamento !== '---' && pagamento !== '';
});

const sortedReservas = computed(() => {
  return [...reservas.value].sort((a, b) => {
    const aKey = `${a.dataISO || ''} ${a.horaInicio || a.horario || ''}`;
    const bKey = `${b.dataISO || ''} ${b.horaInicio || b.horario || ''}`;
    return bKey.localeCompare(aKey);
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedReservas.value.length / pagination.value.perPage)),
);

const paginatedReservas = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage;
  return sortedReservas.value.slice(start, start + pagination.value.perPage);
});

const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);

const paginationSummary = computed(() => {
  if (!sortedReservas.value.length) {
    return 'Mostrando 0 reservas';
  }
  const start = (pagination.value.page - 1) * pagination.value.perPage + 1;
  const end = Math.min(sortedReservas.value.length, pagination.value.page * pagination.value.perPage);
  return `Mostrando ${start}-${end} de ${sortedReservas.value.length} reservas`;
});

const filteredPaidReservas = computed(() => {
  return reservas.value.filter((reserva) => {
    if (reserva.statusKey !== 'CONFIRMADA') {
      return false;
    }
    const pagamento = String(reserva.pagamentoLabel || '').toLowerCase();
    if (!pagamento || pagamento === '---') {
      return false;
    }
    if (paymentFilter.value === 'pix') {
      return pagamento.includes('pix');
    }
    if (paymentFilter.value === 'cartao') {
      return pagamento.includes('cartao');
    }
    return true;
  });
});

const paidSummaryLabel = computed(() => {
  const total = filteredPaidReservas.value.reduce((sum, item) => sum + (Number(item.valor) || 0), 0);
  return formatCurrency(total);
});

const paidSummaryMeta = computed(() => {
  const count = filteredPaidReservas.value.length;
  const label = paymentFilter.value === 'all' ? 'Todos' : paymentFilter.value.toUpperCase();
  return `${count} pagamentos (${label})`;
});

const chartData = computed(() => receitaMensalMap[paymentFilter.value] || receitaMensalMap.all);
const chartMax = computed(() => Math.max(...chartData.value, 1));

const monthLabel = computed(() => {
  try {
    return new Date(currentYear, currentMonth, 1).toLocaleString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    return 'Mes atual';
  }
});

const stats = computed(() => {
  const total = reservas.value.length;
  const confirmadas = reservas.value.filter((item) => item.statusKey === 'CONFIRMADA').length;
  const preReservas = reservas.value.filter((item) => item.statusKey === 'PRE-RESERVA').length;
  const canceladas = reservas.value.filter((item) => item.statusKey === 'CANCELADA').length;

  return {
    total,
    confirmadas,
    preReservas,
    canceladas,
  };
});

const openCreateModal = () => {
  if (!canAccess.value) {
    return;
  }
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const closeDetailsModal = () => {
  selectedReservaId.value = null;
};

const resetCreateForm = () => {
  createForm.value = {
    cliente: '',
    quadra: '',
    data: '',
    horario: '',
    pagamento: 'PIX',
  };
};

const handleCreateReserva = async () => {
  if (!createForm.value.cliente || !createForm.value.quadra || !createForm.value.data || !createForm.value.horario) {
    if (typeof window !== 'undefined') {
      window.alert('Preencha todos os campos da reserva.');
    }
    return;
  }

  const payload = {
    cliente: createForm.value.cliente,
    quadra: createForm.value.quadra,
    data: createForm.value.data,
    horario: createForm.value.horario,
    forma_pagamento: createForm.value.pagamento,
  };

  if (!useMock) {
    await reservasService.createReserva(payload);
  }
  const statusKey = createForm.value.pagamento === 'PIX' ? 'PRE-RESERVA' : 'CONFIRMADA';
  const newReserva = normalizeReserva({
    id: Date.now(),
    cliente: { nome: payload.cliente, email: 'cliente@playero.com' },
    quadra: payload.quadra,
    data: payload.data,
    horaInicio: payload.horario,
    status: statusKey,
    pagamento: payload.forma_pagamento,
    valor: 150,
  });

  reservas.value = [newReserva, ...reservas.value];
  closeCreateModal();
  resetCreateForm();
};

const handleViewDetails = (reserva) => {
  selectedReservaId.value = reserva?.id ?? null;
};

const handleCancelReserva = async (reserva) => {
  if (!reserva?.canCancel) {
    return;
  }

  if (!useMock) {
    await reservasService.cancelarReserva(reserva.id);
  }
  reservas.value = reservas.value.map((item) =>
    item.id === reserva.id
      ? { ...item, statusKey: 'CANCELADA', statusLabel: 'Cancelada', canCancel: false }
      : item,
  );

  if (selectedReservaId.value === reserva.id) {
    selectedReservaId.value = reserva.id;
  }
};

const handleRefundReserva = (reserva) => {
  if (!reserva) {
    return;
  }
  if (typeof window !== 'undefined') {
    window.alert('Devolucao registrada para esta reserva.');
  }
};

const changePage = (page) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  pagination.value.page = safePage;
};

const loadReservas = async () => {
  if (!canAccess.value) {
    return;
  }
  loading.value = true;
  try {
    if (useMock) {
      reservas.value = mockReservas.map(normalizeReserva);
    } else {
      const payload = await reservasService.listReservas();
      const data = payload?.data ?? payload ?? [];
      reservas.value = data.map(normalizeReserva);
    }
  } finally {
    loading.value = false;
  }
};

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas', active: true },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
  { label: 'Perfil', icon: 'user', href: '#' },
];

onMounted(() => {
  loadReservas();
});

watch(
  () => sortedReservas.value.length,
  () => {
    if (pagination.value.page > totalPages.value) {
      pagination.value.page = totalPages.value;
    }
  },
);

watch(
  () => paymentFilter.value,
  () => {
    pagination.value.page = 1;
  },
);
</script>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
  background: var(--dash-bg);
  color: var(--dash-text);
  font-family: 'Sora', 'Space Grotesk', system-ui, sans-serif;
  --dash-bg: var(--app-bg);
  --dash-surface: var(--app-surface);
  --dash-surface-soft: var(--app-surface-soft);
  --dash-soft: var(--app-surface-strong);
  --dash-border: var(--app-border);
  --dash-text: var(--app-text);
  --dash-muted: var(--app-muted);
  --dash-primary: var(--app-accent);
  --dash-primary-soft: var(--app-accent-soft);
  --dash-success: var(--app-success);
  --dash-success-soft: var(--app-success-soft);
  --dash-warning: var(--app-warning);
  --dash-warning-soft: var(--app-warning-soft);
  --dash-danger: var(--app-danger);
  --dash-danger-soft: var(--app-danger-soft);
  --dash-shadow: var(--app-shadow);
  --dash-shadow-soft: var(--app-shadow-soft);
  --dash-radius: 18px;
  --dash-radius-lg: 24px;
  --dash-sidebar-width: 280px;
  --dash-topbar-height: 96px;
  --dash-mobile-nav-height: 72px;
}

.dashboard-main {
  margin-left: var(--dash-sidebar-width);
  padding-top: 32px;
  padding-bottom: 40px;
  min-height: 100vh;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dash-action {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface, #ffffff);
  color: var(--dash-text, #0f172a);
  cursor: pointer;
}

.dash-action--primary {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 18px 40px -28px var(--dash-primary-soft, rgba(255, 122, 0, 0.45));
}

.dash-action--ghost {
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
}

.dash-action--danger {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.access-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.access-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
}

.access-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.access-text {
  margin: 6px 0 0;
  color: var(--dash-muted, #64748b);
  font-size: 0.9rem;
}

.table-card,
.actions-card,
.calendar-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.table-header,
.calendar-header,
.actions-header {
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
  color: var(--dash-text, #0f172a);
}

.table-subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
}

.calendar-header {
  align-items: flex-start;
}

.calendar-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.calendar-filter input {
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--dash-text, #0f172a);
  font-weight: 600;
}

.table-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.table-wrapper {
  overflow-x: auto;
}

.reservas-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

.reservas-table th,
.reservas-table td {
  text-align: left;
  padding: 14px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
  vertical-align: middle;
}

.reservas-table th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.table-empty {
  text-align: center;
  padding: 24px;
  color: var(--dash-muted, #64748b);
}

.actions-card {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 16px;
}

.actions-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.actions-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.actions-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.actions-filter select {
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--dash-text, #0f172a);
  text-transform: none;
  letter-spacing: normal;
  font-weight: 600;
}

.actions-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--dash-muted, #64748b);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-card--wide {
  grid-column: span 2;
}

.metric-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.metric-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--dash-text, #0f172a);
}

.metric-value--success {
  color: var(--dash-success, #16a34a);
}

.metric-value--warning {
  color: var(--dash-warning, #f59e0b);
}

.metric-value--danger {
  color: var(--dash-danger, #ef4444);
}

.metric-meta {
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-action {
  border-radius: 16px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
}

.admin-action-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--dash-primary-soft, rgba(255, 122, 0, 0.18));
  color: var(--dash-primary, #ff7a00);
}

.admin-action-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-action-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.admin-action-sub {
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

.revenue-chart {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.revenue-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.revenue-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.revenue-subtitle {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: var(--dash-muted, #64748b);
}

.revenue-bars {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 6px;
  align-items: end;
  height: 160px;
}

.revenue-bar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.revenue-bar-fill {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(22, 163, 74, 0.95), rgba(22, 163, 74, 0.4));
}

.revenue-axis {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 6px;
  font-size: 0.7rem;
  color: var(--dash-muted, #64748b);
  text-align: center;
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
  color: var(--dash-muted, #64748b);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-button {
  border-radius: 999px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.pagination-button.is-active {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  border-color: transparent;
}

.pagination-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 120;
}

.modal-card {
  width: 100%;
  max-width: 760px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 12px;
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
}

.modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.modal-close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-muted, #64748b);
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
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
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
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.modal-value {
  font-size: 0.95rem;
  color: var(--dash-text, #0f172a);
}

.modal-subvalue {
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--dash-muted, #64748b);
  font-weight: 600;
}

.modal-field input,
.modal-field select {
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .actions-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    justify-content: flex-start;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
