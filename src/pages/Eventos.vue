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
          <SectionHeader title="Eventos">
            <template #actions>
              <button
                v-if="canAccess"
                class="dash-action dash-action--primary"
                type="button"
                @click="openCreateModal"
              >
                <DashboardIcon name="plus" />
                Criar Evento
              </button>
            </template>
          </SectionHeader>

          <div v-if="!canAccess" class="access-card">
            <div class="access-icon">
              <DashboardIcon name="shield" />
            </div>
            <div>
              <h3 class="access-title">Área restrita</h3>
              <p class="access-text">
                Apenas perfis admin ou super_admin podem acessar a gestão de eventos.
              </p>
            </div>
          </div>

          <template v-else>
            <EmptyStateCard
              v-if="!isEventosLoading && !eventos.length"
              title="Nenhum evento encontrado"
              description="Ainda não existe nenhum evento criado."
              icon="sparkle"
            />
            <div v-else class="eventos-grid">
              <article v-for="evento in eventos" :key="evento.id" class="evento-card">
                <div class="evento-card-header">
                  <div>
                    <h3 class="evento-title">{{ evento.nome }}</h3>
                    <p class="evento-type">{{ evento.tipo }}</p>
                  </div>
                  <span class="evento-status" :class="statusClass(evento.status)">
                    {{ statusLabel(evento.status) }}
                  </span>
                </div>

                <div class="evento-details">
                  <div class="evento-detail">
                    <span class="detail-label">Data</span>
                    <strong class="detail-value">{{ formatDate(evento.data) }}</strong>
                  </div>
                  <div class="evento-detail">
                    <span class="detail-label">Horário</span>
                    <strong class="detail-value">
                      {{ formatTimeRange(evento.horaInicio, evento.horaFim) }}
                    </strong>
                  </div>
                  <div class="evento-detail">
                    <span class="detail-label">Local</span>
                    <strong class="detail-value">{{ evento.local || '---' }}</strong>
                  </div>
                </div>

                <div class="evento-actions">
                  <button class="action-button action-button--ghost" type="button" @click="handleViewEvento(evento)">
                    Ver detalhes
                  </button>
                  <button class="action-button" type="button" @click="handleEditEvento(evento)">
                    Editar
                  </button>
                  <button
                    class="action-button action-button--danger"
                    type="button"
                    :disabled="normalizeStatus(evento.status) !== 'ativo'"
                    @click="handleCancelEvento(evento)"
                  >
                    Cancelar evento
                  </button>
                </div>
              </article>
            </div>
          </template>
        </section>
      </div>
    </main>

    <CriarEventoModal
      v-if="canAccess"
      :open="isCreateModalOpen"
      @close="closeCreateModal"
      @created="handleEventoCreated"
    />

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import SectionHeader from '../components/SectionHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';
import EmptyStateCard from '../components/EmptyStateCard.vue';
import CriarEventoModal from '../components/modals/CriarEventoModal.vue';
import { useAuth } from '../stores/auth';
import { eventsService } from '../services/eventsService';

const auth = useAuth();
const userRole = 'admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');
const canAccess = computed(() => ['admin', 'super_admin'].includes(String(userRole).toLowerCase()));

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Administradores', icon: 'shield', href: '/admin/administradores' },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda' },
  { label: 'Eventos', icon: 'sparkle', href: '/admin/eventos', active: true },
];

const generalItems = computed(() =>
  baseGeneralItems.filter((item) => item.label !== 'Administradores' || isSuperAdmin.value),
);

const supportItems = [{ label: 'Configurações', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho rápido',
  description: 'Criar um novo evento em poucos cliques.',
  buttonLabel: 'Novo evento',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});

const eventos = ref([]);
const isEventosLoading = ref(false);
const isCreateModalOpen = ref(false);

const statusMap = {
  ativo: 'Ativo',
  cancelado: 'Cancelado',
  encerrado: 'Encerrado',
};

const normalizeStatus = (value) => {
  const raw = String(value || 'ativo').toLowerCase();
  if (raw.includes('cancel')) {
    return 'cancelado';
  }
  if (raw.includes('encerr') || raw.includes('inativ')) {
    return 'encerrado';
  }
  return 'ativo';
};

const tipoLabelMap = {
  aniversario: 'Aniversario',
  vip: 'Reserva de Area VIP',
  corporativo: 'Evento corporativo',
  gastronomico: 'Evento gastronomico',
  musica_ao_vivo: 'Musica ao vivo / cantores / DJ',
  torneio: 'Torneio',
  outro: 'Evento personalizado',
};

const resolveTipoLabel = (value) => {
  if (!value) {
    return 'Evento personalizado';
  }
  const key = String(value).toLowerCase();
  return tipoLabelMap[key] ?? value;
};

const normalizeEvento = (evento, index = 0) => {
  if (!evento) {
    return null;
  }
  const nome = evento.nome ?? evento.name ?? evento.title;
  return {
    id: evento.id ?? evento.uuid ?? index,
    nome: nome || `Evento ${String(index + 1).padStart(2, '0')}`,
    tipo: resolveTipoLabel(evento.tipo ?? evento.type),
    data: evento.data ?? evento.data_evento ?? evento.dataEvento ?? evento.date ?? '',
    horaInicio:
      evento.hora_inicio ?? evento.horaInicio ?? evento.horaInicial ?? evento.start_time ?? '',
    horaFim: evento.hora_fim ?? evento.horaFim ?? evento.horaFinal ?? evento.end_time ?? '',
    local: evento.local ?? evento.location ?? evento.espaco ?? '---',
    status: normalizeStatus(evento.status ?? evento.status_inicial ?? 'ativo'),
    pago: Boolean(evento.pago ?? evento.is_paid ?? false),
    valor: evento.valor ?? evento.value ?? null,
    privacidade: evento.privacidade ?? evento.privacy ?? evento.visibility ?? 'publico',
    capacidade: evento.capacidade_maxima ?? evento.capacidade ?? evento.max_people ?? null,
    descricao: evento.descricao ?? evento.observacoes ?? evento.description ?? '',
  };
};

const formatDate = (value) => {
  if (!value) {
    return '---';
  }
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString('pt-BR');
};

const formatTime = (value) => {
  if (!value) {
    return '--:--';
  }
  return String(value).slice(0, 5);
};

const formatTimeRange = (start, end) => {
  const startLabel = formatTime(start);
  const endLabel = formatTime(end);
  if (startLabel === '--:--' && endLabel === '--:--') {
    return '--:--';
  }
  return `${startLabel} - ${endLabel}`;
};

const statusLabel = (status) => statusMap[normalizeStatus(status)] || 'Ativo';
const statusClass = (status) => `evento-status--${normalizeStatus(status)}`;

const openCreateModal = () => {
  if (!canAccess.value) {
    return;
  }
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const handleEventoCreated = async (payload) => {
  if (!payload) {
    return;
  }
  const normalized = normalizeEvento({ ...payload, id: Date.now() }, eventos.value.length);
  if (normalized) {
    eventos.value = [normalized, ...eventos.value];
  }
  await loadEventos();
};

const handleViewEvento = (evento) => {
  if (!evento) {
    return;
  }
  // TODO: abrir detalhes integrando com o GET /eventos/{id}.
};

const handleEditEvento = (evento) => {
  if (!evento) {
    return;
  }
  // TODO: abrir modal de edição integrado ao PUT /eventos/{id}.
};

const handleCancelEvento = (evento) => {
  if (!evento || normalizeStatus(evento.status) !== 'ativo') {
    return;
  }
  eventos.value = eventos.value.map((item) =>
    item.id === evento.id ? { ...item, status: 'cancelado' } : item,
  );
};

const resolveMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const resolveCalendarMonths = () => {
  const base = new Date();
  const months = [];
  for (let offset = 0; offset < 12; offset += 1) {
    const candidate = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    months.push(resolveMonthKey(candidate));
  }
  return months;
};

const mergeUniqueEventos = (items) => {
  const unique = new Map();
  items.forEach((item, index) => {
    if (!item) {
      return;
    }
    const key = item.id ?? `${item.date ?? ''}-${item.name ?? item.nome ?? 'evento'}-${index}`;
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });
  return Array.from(unique.values());
};

const loadEventos = async () => {
  if (!canAccess.value) {
    return;
  }
  isEventosLoading.value = true;
  try {
    const payload = await eventsService.listEvents();
    if (payload.length) {
      eventos.value = payload.map(normalizeEvento).filter(Boolean);
      return;
    }

    const months = resolveCalendarMonths();
    const responses = await Promise.all(
      months.map((month) => eventsService.listCalendar({ month })),
    );
    const merged = mergeUniqueEventos(responses.flat());
    eventos.value = merged.map(normalizeEvento).filter(Boolean);
  } catch (error) {
    eventos.value = [];
  } finally {
    isEventosLoading.value = false;
  }
};

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Eventos', icon: 'sparkle', href: '/admin/eventos', active: true },
  { label: 'Perfil', icon: 'user', href: '#' },
];

onMounted(() => {
  loadEventos();
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

.eventos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.evento-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  padding: 18px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evento-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.evento-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.evento-type {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.evento-status {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.evento-status--ativo {
  background: var(--dash-success-soft, rgba(22, 163, 74, 0.2));
  color: var(--dash-success, #16a34a);
  border-color: rgba(22, 163, 74, 0.25);
}

.evento-status--cancelado {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: rgba(239, 68, 68, 0.25);
}

.evento-status--encerrado {
  background: var(--dash-soft, #f1f4f9);
  color: var(--dash-muted, #64748b);
  border-color: var(--dash-border, #e6e9ef);
}

.evento-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.evento-detail {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.detail-value {
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
}

.evento-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
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

.action-button--ghost {
  background: transparent;
  color: var(--dash-muted, #64748b);
}

.action-button--danger {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .eventos-grid {
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
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .eventos-grid {
    grid-template-columns: 1fr;
  }

  .evento-details {
    grid-template-columns: 1fr;
  }
}
</style>
