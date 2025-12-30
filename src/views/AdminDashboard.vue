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
        <section class="dashboard-kpi-grid">
          <KPI v-for="kpi in kpis" :key="kpi.title" :title="kpi.title" :value="kpi.value" :meta="kpi.meta" :icon="kpi.icon" />
        </section>

        <section class="dashboard-section">
          <SectionHeader
            title="Agenda"
            subtitle="Próximos dias fechados e exceções futuras."
          />

          <div class="agenda-grid">
            <div class="agenda-card">
              <header class="agenda-card-header">
                <div>
                  <p class="agenda-card-eyebrow">Fechamentos</p>
                  <h3 class="agenda-card-title">Próximos dias fechados</h3>
                </div>
              </header>

              <div v-if="isAgendaMonthLoading" class="agenda-empty">Carregando agenda...</div>
              <div v-else-if="!upcomingClosedDays.length" class="agenda-empty">
                Nenhum fechamento programado.
              </div>
              <ul v-else class="agenda-list">
                <li v-for="day in upcomingClosedDays" :key="day.key" class="agenda-item">
                  <div class="agenda-item-meta">
                    <span class="agenda-item-date">{{ day.label }}</span>
                    <span class="agenda-item-subtitle">Fechado</span>
                  </div>
                  <span class="agenda-badge agenda-badge--danger">Fechado</span>
                </li>
              </ul>
            </div>

            <div class="agenda-card">
              <header class="agenda-card-header">
                <div>
                  <p class="agenda-card-eyebrow">Exceções</p>
                  <h3 class="agenda-card-title">Exceções futuras</h3>
                </div>
              </header>

              <div v-if="isAgendaExceptionsLoading" class="agenda-empty">Carregando exceções...</div>
              <div v-else-if="!futureExceptions.length" class="agenda-empty">
                Nenhuma exceção futura.
              </div>
              <ul v-else class="agenda-list">
                <li v-for="exception in futureExceptions" :key="exception.key" class="agenda-item">
                  <div class="agenda-item-meta">
                    <span class="agenda-item-date">{{ exception.label }}</span>
                    <span class="agenda-item-subtitle">{{ exception.hours }}</span>
                    <span v-if="exception.motivo" class="agenda-item-subtitle">
                      {{ exception.motivo }}
                    </span>
                  </div>
                  <span class="agenda-badge" :class="exception.badgeClass">{{ exception.badgeLabel }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="dashboard-section">
          <SectionHeader title="Quadras (status em tempo real)">
            <template #actions>
              <button class="dash-action dash-action--ghost" type="button">
                <DashboardIcon name="filter" />
                Filtrar
              </button>
              <button
                v-if="canManageQuadras"
                class="dash-action dash-action--primary"
                type="button"
                @click="openNovaQuadra"
              >
                <DashboardIcon name="plus" />
                Nova Quadra
              </button>
            </template>
          </SectionHeader>

          <EmptyStateCard
            v-if="!isQuadrasLoading && !quadras.length"
            title="Nenhuma quadra encontrada"
            description="Nenhuma quadra criada ainda."
            icon="grid"
          />
          <div v-else class="dashboard-quadra-grid">
            <QuadraCard
              v-for="quadra in quadras"
              :key="quadra.id"
              variant="admin"
              :name="quadra.name"
              :subtitle="quadra.subtitle"
              :status="quadra.status"
              :next-reservation-time="quadra.nextReservation"
              :secondary-action-label="quadra.secondaryActionLabel"
              :primary-action-label="quadra.primaryActionLabel"
            />
          </div>
        </section>

        <section class="dashboard-section">
          <SectionHeader title="Eventos criados">
            <template #actions>
              <button class="dash-action dash-action--primary" type="button">
                <DashboardIcon name="plus" />
                Criar Evento
              </button>
            </template>
          </SectionHeader>

          <EmptyStateCard
            v-if="!isEventosLoading && !eventos.length"
            title="Nenhum evento encontrado"
            description="Nenhum evento criado ainda."
            icon="sparkle"
          />
          <div v-else class="dashboard-event-grid">
            <EventoCard
              v-for="evento in eventos"
              :key="evento.id"
              :title="evento.title"
              :meta="evento.meta"
              :location="evento.location"
              :attendees="evento.attendees"
              :primary-action-label="evento.primaryActionLabel"
              :primary-action-href="evento.primaryActionHref"
              :secondary-action-label="evento.secondaryActionLabel"
              :secondary-action-href="evento.secondaryActionHref"
            />
          </div>
        </section>

        <section class="dashboard-section dashboard-info">
          <div class="info-wrap">
            <h2 class="info-title">Informações gerais</h2>
            <div class="info-grid">
              <div v-for="card in infoCards" :key="card.id" class="info-card">
                <span class="info-label">{{ card.label }}</span>
                <h3 class="info-headline">{{ card.headline }}</h3>
                <p class="info-text">{{ card.text }}</p>
                <p v-for="detail in card.details" :key="detail" class="info-detail">
                  {{ detail }}
                </p>
              </div>
            </div>
          </div>

          <AcoesRapidas title="Ações rápidas" :items="acoesRapidas" />
        </section>
      </div>
    </main>

    <NovaQuadraModal
      v-if="canManageQuadras"
      :open="isNovaQuadraOpen"
      @close="closeNovaQuadra"
      @created="handleQuadraCreated"
    />

    <ModalCriarCliente
      :open="isCreateClientOpen"
      @close="closeCreateClient"
    />

    <ModalCriarReserva
      :open="isCreateReservaOpen"
      @close="closeCreateReserva"
    />

    <ModalCriarAdmin
      v-if="isSuperAdmin"
      :open="isCreateAdminOpen"
      :is-saving="isAdminSaving"
      @close="closeCreateAdmin"
      @submit="handleCreateAdmin"
    />

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import KPI from '../components/KPI.vue';
import SectionHeader from '../components/SectionHeader.vue';
import QuadraCard from '../components/QuadraCard.vue';
import EventoCard from '../components/EventoCard.vue';
import AcoesRapidas from '../components/AcoesRapidas.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';
import EmptyStateCard from '../components/EmptyStateCard.vue';
import NovaQuadraModal from '../components/modals/NovaQuadraModal.vue';
import ModalCriarCliente from '../components/modals/ModalCriarCliente.vue';
import ModalCriarReserva from '../components/modals/ModalCriarReserva.vue';
import ModalCriarAdmin from '../components/modals/ModalCriarAdmin.vue';
import { useAlert } from '../composables/useAlert';
import { useAuth } from '../stores/auth';
import { useAgendaStore } from '../stores/useAgendaStore';
import { adminDashboardService } from '../services/adminDashboardService';
import { normalizeSingleQuadra, quadrasService } from '../services/quadrasService';

const auth = useAuth();
const { showAlert } = useAlert();
const agendaStore = useAgendaStore();
const userRole = 'super_admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');
const canManageQuadras = computed(() =>
  ['admin', 'super_admin'].includes(userRole.toLowerCase()),
);
const canManageReservas = computed(() =>
  ['admin', 'super_admin'].includes(userRole.toLowerCase()),
);

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '#', active: true },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Administradores', icon: 'shield', href: '/admin/administradores' },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda' },
  { label: 'Eventos', icon: 'sparkle', href: '/admin/eventos' },
];

const generalItems = computed(() =>
  baseGeneralItems.filter((item) => item.label !== 'Administradores' || isSuperAdmin.value),
);

const supportItems = [{ label: 'Configurações', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho rápido',
  description: 'Criar um novo evento em poucos cliques.',
  buttonLabel: 'Novo Evento',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});

const defaultKpis = [
  {
    title: 'Quadras livres agora',
    value: 0,
    meta: 'Prontas para reservar',
    icon: 'grid',
  },
  {
    title: 'Quadras sem reservas',
    value: 0,
    meta: 'Sem agenda futura',
    icon: 'calendar',
  },
  {
    title: 'Reservas em andamento',
    value: 0,
    meta: 'Status: hoje',
    icon: 'clipboard',
  },
];

const kpis = ref([...defaultKpis]);
const quadras = ref([]);
const eventos = ref([]);
const isQuadrasLoading = ref(true);
const isEventosLoading = ref(true);

const agendaLoading = agendaStore.loading;
const isAgendaMonthLoading = computed(() => agendaLoading.value.month);
const isAgendaExceptionsLoading = computed(() => agendaLoading.value.exceptions);

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveAgendaDateKey = (value) => {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return formatLocalDate(value);
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

const formatAgendaDate = (value) => {
  const key = resolveAgendaDateKey(value);
  if (!key) {
    return value || '--';
  }
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return key;
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const upcomingClosedDays = computed(() => {
  const todayKey = formatLocalDate(new Date());
  const days = agendaStore.month.value?.days ?? [];
  return days
    .map((item, index) => {
      const dateKey = resolveAgendaDateKey(
        item?.date ?? item?.data ?? item?.dia ?? item?.day,
      );
      const status = String(item?.status ?? item?.state ?? '').toLowerCase();
      if (!dateKey || status !== 'closed' || dateKey < todayKey) {
        return null;
      }
      return {
        key: `${dateKey}-${index}`,
        date: dateKey,
        label: formatAgendaDate(dateKey),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
});

const futureExceptions = computed(() => {
  const todayKey = formatLocalDate(new Date());
  const items = agendaStore.exceptions.value ?? [];
  return items
    .map((exception, index) => {
      const dateKey = resolveAgendaDateKey(exception?.data ?? exception?.date);
      if (!dateKey || dateKey < todayKey) {
        return null;
      }
      const fechado = Boolean(exception?.fechado);
      const horaAbertura = exception?.hora_abertura ?? '--:--';
      const horaFechamento = exception?.hora_fechamento ?? '--:--';
      return {
        key: `${dateKey}-${exception?.id ?? index}`,
        date: dateKey,
        label: formatAgendaDate(dateKey),
        hours: fechado ? 'Fechado o dia todo' : `${horaAbertura} - ${horaFechamento}`,
        motivo: exception?.motivo ?? '',
        badgeLabel: fechado ? 'Fechado' : 'Hor\u00e1rio especial',
        badgeClass: fechado ? 'agenda-badge--danger' : 'agenda-badge--warning',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
});

const infoCards = [
  {
    id: 1,
    label: 'Hoje',
    headline: 'Fluxo estimado',
    text: 'Movimento moderado no bar e nas quadras.',
    details: [],
  },
  {
    id: 2,
    label: 'Alertas',
    headline: '1 quadra em manuten\u00e7\u00e3o',
    text: 'Verificar rede, ilumina\u00e7\u00e3o e areia.',
    details: [],
  },
  {
    id: 3,
    label: 'Financeiro',
    headline: 'Resumo do dia (mock)',
    text: 'Receita prevista: R$ 3.420',
    details: ['Ticket m\u00e9dio: R$ 68'],
  },
  {
    id: 4,
    label: 'Equipe',
    headline: 'Administradores ativos',
    text: '2 colaboradores gerindo reservas agora.',
    details: [],
  },
];

const isNovaQuadraOpen = ref(false);
const isCreateClientOpen = ref(false);
const isCreateReservaOpen = ref(false);
const isCreateAdminOpen = ref(false);
const isAdminSaving = ref(false);

const openNovaQuadra = () => {
  if (!canManageQuadras.value) {
    return;
  }
  isNovaQuadraOpen.value = true;
};

const closeNovaQuadra = () => {
  isNovaQuadraOpen.value = false;
};

const openCreateReserva = () => {
  if (!canManageReservas.value) {
    return;
  }
  isCreateReservaOpen.value = true;
};

const closeCreateReserva = () => {
  isCreateReservaOpen.value = false;
};

const openCreateClient = () => {
  isCreateClientOpen.value = true;
};

const closeCreateClient = () => {
  isCreateClientOpen.value = false;
};

const openCreateAdmin = () => {
  if (!isSuperAdmin.value) {
    return;
  }
  isCreateAdminOpen.value = true;
};

const closeCreateAdmin = () => {
  isCreateAdminOpen.value = false;
};

const handleCreateAdmin = async (payload) => {
  if (!isSuperAdmin.value) {
    return;
  }
  isAdminSaving.value = true;
  try {
    if (!payload) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    closeCreateAdmin();
  } finally {
    isAdminSaving.value = false;
  }
};

const resolveQuadraId = (quadra) =>
  quadra?.id ?? quadra?.quadra_id ?? quadra?.uuid ?? quadra?.codigo ?? null;

const handleQuadraCreated = async (created) => {
  const normalized =
    normalizeSingleQuadra(created, { includeInactive: true }) ?? created;
  const quadraId = resolveQuadraId(normalized);
  if (!quadraId) {
    await loadQuadras();
    return;
  }
  const [item] = normalizeAdminQuadras([normalized]);
  if (item) {
    quadras.value = [
      item,
      ...quadras.value.filter((quadra) => String(quadra.id) !== String(quadraId)),
    ];
  }
  await loadQuadras();
};

const acoesRapidas = computed(() => [
  { label: 'Criar cliente', icon: 'user-plus', action: openCreateClient, href: '#' },
  {
    label: 'Criar reserva',
    icon: 'calendar-plus',
    action: canManageReservas.value ? openCreateReserva : null,
    href: canManageReservas.value ? '#' : '/admin/reservas',
  },
  {
    label: 'Adicionar quadra',
    icon: 'grid-plus',
    action: canManageQuadras.value ? openNovaQuadra : null,
    href: canManageQuadras.value ? '#' : '/admin/quadras',
  },
  {
    label: 'Novo administrador',
    icon: 'shield',
    action: isSuperAdmin.value ? openCreateAdmin : null,
    href: isSuperAdmin.value ? '#' : '/admin/administradores',
  },
  { label: 'Bloquear horário', icon: 'ban', href: '/admin/agenda' },
]);

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '#', active: true },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Eventos', icon: 'sparkle', href: '/admin/eventos' },
  { label: 'Perfil', icon: 'user', href: '#' },
];

const resolveKpis = (payload) => {
  const data = payload?.data ?? payload ?? {};

  if (Array.isArray(data?.kpis)) {
    return data.kpis.map((item, index) => ({
      title: item?.title ?? defaultKpis[index]?.title ?? '',
      value: item?.value ?? item?.count ?? item?.total ?? defaultKpis[index]?.value ?? 0,
      meta: item?.meta ?? item?.label ?? defaultKpis[index]?.meta ?? '',
      icon: item?.icon ?? defaultKpis[index]?.icon ?? 'grid',
    }));
  }

  const metrics = data?.metrics ?? data;
  return [
    {
      ...defaultKpis[0],
      value:
        metrics?.quadras_livres ??
        metrics?.quadrasLivres ??
        metrics?.quadras_disponiveis ??
        metrics?.livres ??
        defaultKpis[0].value,
    },
    {
      ...defaultKpis[1],
      value:
        metrics?.quadras_sem_reserva ??
        metrics?.quadrasSemReserva ??
        metrics?.sem_reservas ??
        defaultKpis[1].value,
    },
    {
      ...defaultKpis[2],
      value:
        metrics?.reservas_ativas ??
        metrics?.reservasAndamento ??
        metrics?.reservas_em_andamento ??
        defaultKpis[2].value,
    },
  ];
};

const resolveQuadraStatus = (quadra) => {
  const rawStatus = quadra?.status ?? quadra?.raw?.status;
  if (rawStatus) {
    return String(rawStatus);
  }
  if (quadra?.raw?.ativa === false || quadra?.raw?.ativo === false) {
    return 'Manuten\u00e7\u00e3o';
  }
  return 'Livre';
};

const normalizeAdminQuadras = (items) =>
  items.map((quadra) => ({
    id: quadra.id,
    name: quadra.name,
    subtitle: quadra.type,
    status: resolveQuadraStatus(quadra),
    nextReservation:
      quadra.raw?.proxima_reserva ?? quadra.raw?.next_reservation ?? 'Sem reservas',
    secondaryActionLabel: 'Ver detalhes',
    primaryActionLabel: 'Reservar',
  }));

const normalizeEvento = (evento, index) => {
  if (!evento) {
    return null;
  }
  const title = evento.title ?? evento.nome ?? evento.name;
  if (!title) {
    return null;
  }

  const primaryActionHref =
    evento.primaryActionHref ??
    evento.primary_action_href ??
    evento.list_url ??
    evento.lista_url ??
    '';
  const secondaryActionHref =
    evento.secondaryActionHref ??
    evento.secondary_action_href ??
    evento.manage_url ??
    evento.gerenciar_url ??
    '';

  return {
    id: evento.id ?? evento.uuid ?? index,
    title,
    attendees: evento.attendees ?? evento.inscritos ?? evento.participantes ?? 0,
    meta:
      evento.meta ??
      evento.data ??
      evento.data_evento ??
      evento.dataEvento ??
      evento.data_formatada ??
      '',
    location: evento.location ?? evento.local ?? evento.endereco ?? evento.espaco ?? '',
    primaryActionLabel:
      evento.primaryActionLabel ?? (primaryActionHref ? 'Ver lista' : ''),
    primaryActionHref: primaryActionHref || '#',
    secondaryActionLabel:
      evento.secondaryActionLabel ?? (secondaryActionHref ? 'Gerenciar' : ''),
    secondaryActionHref: secondaryActionHref || '#',
  };
};

const resolveEventos = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const items =
    data?.eventos ??
    data?.events ??
    data?.eventos_criados ??
    data?.data?.eventos ??
    data?.data?.events ??
    [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(normalizeEvento).filter(Boolean);
};

const handleForbidden = (error, fallback) => {
  if (error?.response?.status !== 403) {
    return false;
  }
  showAlert({
    type: 'warning',
    title: 'Acesso restrito',
    message: error?.normalized?.message || fallback,
    confirmText: 'Ok',
  });
  return true;
};

const loadDashboard = async () => {
  isEventosLoading.value = true;
  try {
    const payload = await adminDashboardService.getDashboard();
    const normalized = resolveKpis(payload);
    if (normalized.length) {
      kpis.value = normalized;
    }
    eventos.value = resolveEventos(payload);
  } catch (error) {
    handleForbidden(error, 'Sem permiss\u00e3o para acessar o dashboard.');
  } finally {
    isEventosLoading.value = false;
  }
};

const loadQuadras = async () => {
  isQuadrasLoading.value = true;
  try {
    const items = await quadrasService.listQuadras({ includeInactive: true });
    quadras.value = normalizeAdminQuadras(items);
  } catch (error) {
    handleForbidden(error, 'Sem permiss\u00e3o para listar quadras.');
  } finally {
    isQuadrasLoading.value = false;
  }
};

const loadAgendaHighlights = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  await Promise.allSettled([
    agendaStore.loadMonth({ year, month, ano: year, mes: month }, { force: true }),
    agendaStore.loadExceptions(),
  ]);
};

onMounted(() => {
  loadDashboard();
  loadQuadras();
  loadAgendaHighlights();
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

.dashboard-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-quadra-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.dashboard-event-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-info {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.agenda-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.agenda-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.agenda-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.agenda-card-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.agenda-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.agenda-empty {
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agenda-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
}

.agenda-item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agenda-item-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.agenda-item-subtitle {
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

.agenda-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
}

.agenda-badge--danger {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.agenda-badge--warning {
  background: var(--dash-warning-soft, rgba(245, 158, 11, 0.2));
  color: var(--dash-warning, #f59e0b);
  border-color: transparent;
}

.info-wrap {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 20px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.info-title {
  margin: 0 0 18px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-card {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.info-headline {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.info-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.info-detail {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
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

@media (max-width: 1200px) {
  .dashboard-kpi-grid,
  .dashboard-quadra-grid,
  .dashboard-event-grid,
  .agenda-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-info {
    grid-template-columns: 1fr;
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

  .dashboard-kpi-grid,
  .dashboard-quadra-grid,
  .dashboard-event-grid,
  .agenda-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }
}
</style>

