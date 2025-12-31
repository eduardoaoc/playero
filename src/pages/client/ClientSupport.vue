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
        <SectionHeader title="Suporte" subtitle="Abra tickets e acompanhe respostas.">
          <template #actions>
            <button class="dash-action dash-action--primary" type="button" @click="openCreate">
              <DashboardIcon name="plus" />
              Abrir ticket
            </button>
          </template>
        </SectionHeader>

        <EmptyStateCard
          v-if="!isLoading && !tickets.length"
          title="Nenhum ticket encontrado"
          description="Voc\u00ea ainda n\u00e3o abriu nenhum ticket."
          icon="clipboard"
          action-label="Abrir ticket"
          :action-callback="openCreate"
        />

        <div v-else class="table-card">
          <div class="table-header">
            <div>
              <h3 class="table-title">Seus tickets</h3>
              <p class="table-subtitle">Acompanhe o status das solicita\u00e7\u00f5es.</p>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="client-table">
              <thead>
                <tr>
                  <th>Assunto</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>A\u00e7\u00f5es</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="4" class="table-empty">Carregando tickets...</td>
                </tr>
                <tr v-else-if="!paginatedTickets.length">
                  <td colspan="4" class="table-empty">Nenhum ticket encontrado.</td>
                </tr>
                <tr v-for="ticket in paginatedTickets" :key="ticket.id">
                  <td>
                    <div class="ticket-subject">
                      <p class="ticket-title">{{ ticket.subject }}</p>
                      <span class="ticket-meta">#{{ ticket.id }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" :class="statusPillClass(ticket.status)">
                      {{ statusLabel(ticket.status) }}
                    </span>
                  </td>
                  <td>{{ formatDate(ticket.createdAt) }}</td>
                  <td>
                    <button class="action-button" type="button" @click="openDetails(ticket)">
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

    <div v-if="isCreateOpen" class="modal-overlay" @click="closeCreate">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Novo ticket</p>
            <h3 class="modal-title">Abrir ticket</h3>
          </div>
          <button class="modal-close" type="button" @click="closeCreate">
            <DashboardIcon name="x" />
          </button>
        </header>

        <form class="modal-body" @submit.prevent="handleCreate">
          <label class="form-field">
            <span>Assunto</span>
            <input v-model.trim="form.subject" type="text" placeholder="Ex: Ajuste de hor\u00e1rio" />
            <small v-if="formErrors.subject" class="field-error">{{ formErrors.subject }}</small>
          </label>

          <label class="form-field">
            <span>Mensagem</span>
            <textarea v-model.trim="form.message" rows="4" placeholder="Descreva sua solicita\u00e7\u00e3o"></textarea>
            <small v-if="formErrors.message" class="field-error">{{ formErrors.message }}</small>
          </label>

          <label class="form-field">
            <span>Prioridade</span>
            <select v-model="form.priority">
              <option value="baixa">Baixa</option>
              <option value="media">M\u00e9dia</option>
              <option value="alta">Alta</option>
            </select>
          </label>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeCreate">
              Cancelar
            </button>
            <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="selectedTicket" class="modal-overlay" @click="closeDetails">
      <div class="modal-card" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Detalhes do ticket</p>
            <h3 class="modal-title">{{ selectedTicket.subject }}</h3>
          </div>
          <button class="modal-close" type="button" @click="closeDetails">
            <DashboardIcon name="x" />
          </button>
        </header>

        <div class="modal-body">
          <div class="modal-grid">
            <div class="modal-item">
              <span class="modal-label">Status</span>
              <span class="status-pill" :class="statusPillClass(selectedTicket.status)">
                {{ statusLabel(selectedTicket.status) }}
              </span>
            </div>
            <div class="modal-item">
              <span class="modal-label">Criado em</span>
              <strong class="modal-value">{{ formatDate(selectedTicket.createdAt) }}</strong>
            </div>
            <div class="modal-item">
              <span class="modal-label">Prioridade</span>
              <strong class="modal-value">{{ priorityLabel(selectedTicket.priority) }}</strong>
            </div>
          </div>

          <div class="modal-note">
            <span class="modal-label">Mensagem</span>
            <p>{{ selectedTicket.message || 'Sem mensagem adicional.' }}</p>
          </div>

          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeDetails">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '../../components/Sidebar.vue';
import SectionHeader from '../../components/SectionHeader.vue';
import EmptyStateCard from '../../components/EmptyStateCard.vue';
import MobileNav from '../../components/MobileNav.vue';
import DashboardIcon from '../../components/DashboardIcon.vue';
import api from '../../services/apiClient';
import { useAuth } from '../../stores/auth';
import { useToast } from '../../composables/useToast';

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

const tickets = ref([]);
const selectedTicket = ref(null);
const isLoading = ref(false);
const isCreateOpen = ref(false);
const isSaving = ref(false);

const pagination = ref({
  page: 1,
  perPage: 10,
});

const form = reactive({
  subject: '',
  message: '',
  priority: 'media',
});

const formErrors = reactive({
  subject: '',
  message: '',
});

const mockTickets = [
  {
    id: 341,
    subject: 'D\u00favida sobre hor\u00e1rio',
    status: 'aberto',
    createdAt: '2025-01-02T10:20:00Z',
    message: 'Gostaria de confirmar se o hor\u00e1rio das 19h est\u00e1 dispon\u00edvel.',
    priority: 'media',
  },
  {
    id: 355,
    subject: 'Reagendar reserva',
    status: 'em_andamento',
    createdAt: '2025-01-04T15:10:00Z',
    message: 'Preciso ajustar a data da minha reserva para a pr\u00f3xima semana.',
    priority: 'alta',
  },
];

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
    message: item?.message ?? item?.mensagem ?? '',
    priority: item?.priority ?? item?.prioridade ?? 'media',
  };
};

const totalPages = computed(() =>
  Math.max(1, Math.ceil(tickets.value.length / pagination.value.perPage)),
);

const paginatedTickets = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage;
  return tickets.value.slice(start, start + pagination.value.perPage);
});

const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);

const paginationSummary = computed(() => {
  if (!tickets.value.length) {
    return 'Mostrando 0 tickets';
  }
  const start = (pagination.value.page - 1) * pagination.value.perPage + 1;
  const end = Math.min(tickets.value.length, pagination.value.page * pagination.value.perPage);
  return `Mostrando ${start}-${end} de ${tickets.value.length} tickets`;
});

const statusLabel = (status) => {
  const map = {
    aberto: 'Aberto',
    em_andamento: 'Em andamento',
    fechado: 'Fechado',
  };
  return map[status] || status;
};

const statusPillClass = (status) => {
  const map = {
    aberto: 'status-pill--warning',
    em_andamento: 'status-pill--info',
    fechado: 'status-pill--neutral',
  };
  return map[status] || 'status-pill--neutral';
};

const priorityLabel = (priority) => {
  const map = {
    baixa: 'Baixa',
    media: 'M\u00e9dia',
    alta: 'Alta',
  };
  return map[priority] || 'M\u00e9dia';
};

const formatDate = (value) => {
  if (!value) {
    return '--/--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('pt-BR');
};

const changePage = (page) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  pagination.value.page = safePage;
};

const openCreate = () => {
  isCreateOpen.value = true;
};

const closeCreate = () => {
  isCreateOpen.value = false;
  clearFormErrors();
};

const openDetails = (ticket) => {
  selectedTicket.value = ticket;
};

const closeDetails = () => {
  selectedTicket.value = null;
};

const clearFormErrors = () => {
  formErrors.subject = '';
  formErrors.message = '';
};

const handleCreate = async () => {
  if (isSaving.value) {
    return;
  }

  clearFormErrors();

  if (!form.subject.trim()) {
    formErrors.subject = 'Informe o assunto.';
  }
  if (!form.message.trim()) {
    formErrors.message = 'Descreva sua solicita\u00e7\u00e3o.';
  }

  if (formErrors.subject || formErrors.message) {
    toast.error('Preencha os campos obrigat\u00f3rios.');
    return;
  }

  isSaving.value = true;

  try {
    const payload = {
      subject: form.subject.trim(),
      message: form.message.trim(),
      priority: form.priority,
    };

    if (mockMode) {
      const created = normalizeTicket({
        id: Date.now(),
        subject: payload.subject,
        message: payload.message,
        priority: payload.priority,
        status: 'aberto',
        created_at: new Date().toISOString(),
      });
      tickets.value = [created, ...tickets.value];
      toast.success('Ticket criado com sucesso.');
      closeCreate();
      form.subject = '';
      form.message = '';
      form.priority = 'media';
      return;
    }

    const response = await api.post('/api/v1/my-tickets', payload);
    const created = normalizeTicket(response?.data?.data ?? response?.data ?? response);
    tickets.value = [created, ...tickets.value];
    toast.success('Ticket criado com sucesso.');
    closeCreate();
    form.subject = '';
    form.message = '';
    form.priority = 'media';
  } catch (error) {
    const status = error?.response?.status;
    if (status === 422) {
      const errors = error?.response?.data?.errors ?? error?.normalized?.errors ?? {};
      formErrors.subject = errors.subject?.[0] ?? formErrors.subject;
      formErrors.message = errors.message?.[0] ?? formErrors.message;
      toast.error('Corrija os erros e tente novamente.');
      return;
    }
    toast.error('N\u00e3o foi poss\u00edvel abrir o ticket.');
  } finally {
    isSaving.value = false;
  }
};

const loadTickets = async () => {
  isLoading.value = true;
  if (mockMode) {
    tickets.value = mockTickets.map(normalizeTicket);
    isLoading.value = false;
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
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => tickets.value.length,
  () => {
    if (pagination.value.page > totalPages.value) {
      pagination.value.page = totalPages.value;
    }
  },
);

onMounted(() => {
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
  gap: 22px;
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

.ticket-subject {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-title {
  margin: 0;
  font-weight: 600;
}

.ticket-meta {
  font-size: 0.78rem;
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

.status-pill--warning {
  background: var(--dash-warning-soft);
  color: var(--dash-warning);
}

.status-pill--info {
  background: rgba(25, 118, 210, 0.2);
  color: #88b7ff;
}

.status-pill--neutral {
  background: rgba(255, 255, 255, 0.08);
  color: var(--dash-muted);
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

.modal-note {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
}

.modal-note p {
  margin: 6px 0 0;
  color: var(--dash-text);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--dash-muted);
  font-weight: 600;
}

.form-field input,
.form-field textarea,
.form-field select {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f0f12;
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field textarea {
  resize: vertical;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: rgba(255, 122, 0, 0.6);
  box-shadow: 0 0 0 2px rgba(255, 122, 0, 0.2);
}

.field-error {
  color: #ff5f6b;
  font-size: 0.75rem;
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


