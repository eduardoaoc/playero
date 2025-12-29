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
            title="Gestao de clientes"
            subtitle="Acompanhe contas, reservas e status em tempo real."
          >
            <template #actions>
              <button class="dash-action dash-action--ghost" type="button">
                <DashboardIcon name="filter" />
                Exportar lista
              </button>
              <button v-if="isSuperAdmin" class="dash-action dash-action--primary" type="button">
                <DashboardIcon name="user-plus" />
                Novo cliente
              </button>
            </template>
          </SectionHeader>

          <div class="filters-card">
            <div class="filters-grid">
              <label class="filter-field">
                <span>Nome</span>
                <input
                  v-model="filters.name"
                  type="search"
                  placeholder="Buscar por nome"
                />
              </label>
              <label class="filter-field">
                <span>Email</span>
                <input
                  v-model="filters.email"
                  type="search"
                  placeholder="Buscar por email"
                />
              </label>
              <label class="filter-field">
                <span>Telefone</span>
                <input
                  v-model="filters.phone"
                  type="search"
                  placeholder="Buscar por telefone"
                />
              </label>
              <div class="filter-actions">
                <button class="dash-action dash-action--ghost" type="button" @click="clearFilters">
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>

          <div class="table-card">
            <div class="table-header">
              <div>
                <h3 class="table-title">Todos os clientes</h3>
                <p class="table-subtitle">Lista completa com dados de reservas.</p>
              </div>
              <div class="table-legend">
                <span class="legend-item">
                  <span class="status-badge status-badge--active"></span>
                  Ativo
                </span>
                <span class="legend-item">
                  <span class="status-badge status-badge--blocked"></span>
                  Bloqueado
                </span>
              </div>
            </div>

            <div class="table-wrapper">
              <table class="clients-table">
                <thead>
                  <tr>
                    <th class="table-check"></th>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Contato</th>
                    <th>Reservas</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="7" class="table-empty">Carregando clientes...</td>
                  </tr>
                  <tr v-else-if="!paginatedClients.length">
                    <td colspan="7" class="table-empty">
                      Nenhum cliente encontrado com os filtros atuais.
                    </td>
                  </tr>
                  <tr v-for="client in paginatedClients" :key="client.id">
                    <td class="table-check">
                      <input
                        v-model="selectedClientIds"
                        class="client-checkbox"
                        type="checkbox"
                        :value="client.id"
                        aria-label="Selecionar cliente"
                      />
                    </td>
                    <td>
                      <div class="client-name">
                        <span class="client-avatar">{{ client.name.charAt(0) }}</span>
                        <div>
                          <p class="client-primary">{{ client.name }}</p>
                          <p class="client-secondary">ID {{ client.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="client-info">{{ client.email }}</td>
                    <td class="client-info">{{ client.phone }}</td>
                    <td>
                      <span class="reservas-pill">{{ client.reservasTotal }}</span>
                    </td>
                    <td>
                      <span class="status-pill" :class="statusPillClass(client.status)">
                        {{ statusLabel(client.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-button" type="button" @click="handleViewDetails(client)">
                          <DashboardIcon name="arrow-up-right" :size="16" />
                          Ver detalhes
                        </button>
                      </div>
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
                  Proximo
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div v-if="selectedClient" class="modal-overlay" @click="closeModal">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Detalhes do cliente</p>
            <h3 class="modal-title">{{ selectedClient.name }}</h3>
          </div>
          <button class="modal-close" type="button" @click="closeModal">
            <DashboardIcon name="x" />
          </button>
        </header>

        <div class="modal-body">
          <div class="modal-grid">
            <div class="modal-item">
              <span class="modal-label">ID</span>
              <strong class="modal-value">#{{ selectedClient.id }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Status da conta</span>
              <span class="status-pill" :class="statusPillClass(selectedClient.status)">
                {{ statusLabel(selectedClient.status) }}
              </span>
            </div>
            <div class="modal-item">
              <span class="modal-label">Email</span>
              <strong class="modal-value">{{ selectedClient.email }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Telefone</span>
              <strong class="modal-value">{{ selectedClient.phone }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Criado em</span>
              <strong class="modal-value">{{ formatDate(selectedClient.createdAt) }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Total de reservas</span>
              <strong class="modal-value">{{ selectedClient.reservasTotal }}</strong>
            </div>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeModal">
              Fechar
            </button>
            <button
              v-if="isSuperAdmin"
              class="dash-action"
              type="button"
              @click="handleEdit(selectedClient)"
            >
              <DashboardIcon name="settings" />
              Editar cliente
            </button>
            <button
              v-if="isSuperAdmin"
              class="dash-action dash-action--danger"
              type="button"
              @click="toggleStatus(selectedClient)"
            >
              <DashboardIcon :name="selectedClient.status === 'ativo' ? 'ban' : 'check'" />
              {{ selectedClient.status === 'ativo' ? 'Bloquear' : 'Desbloquear' }}
            </button>
            <button
              v-if="isSuperAdmin"
              class="dash-action dash-action--ghost"
              type="button"
              @click="handleResetPassword(selectedClient)"
            >
              <DashboardIcon name="shield" />
              Redefinir senha
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
import { useAuth } from '../stores/auth';
import { clientsService } from '../services/clientsService';

const auth = useAuth();
const userRole = 'super_admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes', active: true },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
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
  description: 'Criar um novo cliente em poucos cliques.',
  buttonLabel: 'Novo cliente',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});

const filters = ref({
  name: '',
  email: '',
  phone: '',
});

const pagination = ref({
  page: 1,
  perPage: 6,
});

const clients = ref([]);
const loading = ref(false);
const selectedClientIds = ref([]);
const selectedClientId = ref(null);

const normalizeClient = (client) => ({
  id: client.id,
  name: client.name ?? client.nome ?? 'Cliente',
  email: client.email ?? 'email@playero.com',
  phone: client.phone ?? client.telefone ?? client.contato ?? '---',
  createdAt: client.createdAt ?? client.criado_em ?? client.created_at ?? '',
  reservasTotal: client.reservasTotal ?? client.total_reservas ?? client.reservas ?? 0,
  status: client.status ?? (client.ativo === false ? 'bloqueado' : 'ativo'),
});

const filteredClients = computed(() => {
  const nameQuery = filters.value.name.trim().toLowerCase();
  const emailQuery = filters.value.email.trim().toLowerCase();
  const phoneQuery = filters.value.phone.trim().toLowerCase();

  return clients.value.filter((client) => {
    const nameMatch = client.name.toLowerCase().includes(nameQuery);
    const emailMatch = client.email.toLowerCase().includes(emailQuery);
    const phoneMatch = client.phone.toLowerCase().includes(phoneQuery);
    return nameMatch && emailMatch && phoneMatch;
  });
});

const selectedClient = computed(
  () => clients.value.find((client) => client.id === selectedClientId.value) || null,
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredClients.value.length / pagination.value.perPage)),
);

const paginatedClients = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage;
  return filteredClients.value.slice(start, start + pagination.value.perPage);
});

const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);

const paginationSummary = computed(() => {
  if (!filteredClients.value.length) {
    return 'Mostrando 0 clientes';
  }
  const start = (pagination.value.page - 1) * pagination.value.perPage + 1;
  const end = Math.min(filteredClients.value.length, pagination.value.page * pagination.value.perPage);
  return `Mostrando ${start}-${end} de ${filteredClients.value.length} clientes`;
});

const formatDate = (value) => {
  if (!value) {
    return '---';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('pt-BR');
};

const statusLabel = (status) => (status === 'bloqueado' ? 'Bloqueado' : 'Ativo');
const statusPillClass = (status) =>
  status === 'bloqueado' ? 'status-pill--blocked' : 'status-pill--active';

const changePage = (page) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  pagination.value.page = safePage;
};

const clearFilters = () => {
  filters.value = { name: '', email: '', phone: '' };
  pagination.value.page = 1;
};

const handleViewDetails = (client) => {
  selectedClientId.value = client?.id ?? null;
};

const closeModal = () => {
  selectedClientId.value = null;
};

const handleEdit = (client) => {
  if (!client) {
    return;
  }
  // TODO: abrir formulario de edicao integrado ao PUT /clients/{id}.
};

const toggleStatus = async (client) => {
  if (!isSuperAdmin || !client) {
    return;
  }
  const nextStatus = client.status === 'ativo' ? 'bloqueado' : 'ativo';
  await clientsService.updateStatus(client.id, { status: nextStatus });
  clients.value = clients.value.map((item) =>
    item.id === client.id ? { ...item, status: nextStatus } : item,
  );
};

const handleResetPassword = async (client) => {
  if (!isSuperAdmin || !client) {
    return;
  }
  await clientsService.updatePassword(client.id, { reset: true });
};

const loadClients = async () => {
  loading.value = true;
  try {
    const payload = await clientsService.listClients();
    const data = payload?.data ?? payload ?? [];
    clients.value = data.map(normalizeClient);
  } finally {
    loading.value = false;
  }
};

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes', active: true },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
  { label: 'Perfil', icon: 'user', href: '#' },
];

watch(
  () => [filters.value.name, filters.value.email, filters.value.phone],
  () => {
    pagination.value.page = 1;
  },
);

watch(
  () => filteredClients.value.length,
  () => {
    if (pagination.value.page > totalPages.value) {
      pagination.value.page = totalPages.value;
    }
  },
);

onMounted(() => {
  loadClients();
});
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
  max-width: 1180px;
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

.filters-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--dash-muted, #64748b);
  font-weight: 600;
}

.filter-field input {
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
}

.filter-field input::placeholder {
  color: var(--dash-muted, #64748b);
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.table-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
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
  color: var(--dash-text, #0f172a);
}

.table-subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
}

.table-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.status-badge--active {
  background: var(--dash-success, #16a34a);
}

.status-badge--blocked {
  background: var(--dash-danger, #ef4444);
}

.table-wrapper {
  overflow-x: auto;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.clients-table th,
.clients-table td {
  text-align: left;
  padding: 14px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
  vertical-align: middle;
}

.clients-table th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.table-check {
  width: 44px;
  text-align: center;
}

.client-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--dash-primary, #ff7a00);
  cursor: pointer;
}

.table-empty {
  text-align: center;
  padding: 24px;
  color: var(--dash-muted, #64748b);
}

.client-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-avatar {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: var(--dash-primary-soft, rgba(255, 122, 0, 0.15));
  color: var(--dash-primary, #ff7a00);
  font-weight: 700;
  display: grid;
  place-items: center;
}

.client-primary {
  margin: 0;
  font-weight: 600;
}

.client-secondary {
  margin: 0;
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

.client-info {
  color: var(--dash-muted, #64748b);
}

.reservas-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
}

.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-pill--active {
  background: var(--dash-success-soft, rgba(22, 163, 74, 0.2));
  color: var(--dash-success, #16a34a);
}

.status-pill--blocked {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.2));
  color: var(--dash-danger, #ef4444);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-button {
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.action-button--danger {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.action-button--ghost {
  background: transparent;
  color: var(--dash-muted, #64748b);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 110;
}

.modal-card {
  width: 100%;
  max-width: 720px;
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

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
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

@media (max-width: 1200px) {
  .filters-grid {
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
}

@media (max-width: 768px) {
  .dashboard-main {
    padding-top: 24px;
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
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
