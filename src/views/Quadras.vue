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
              :next-reservation-label="quadra.nextReservationLabel"
              :next-reservation-time="quadra.nextReservation"
              :secondary-action-label="quadra.secondaryActionLabel"
              :primary-action-label="quadra.primaryActionLabel"
            />
          </div>
        </section>
      </div>
    </main>

    <NovaQuadraModal
      v-if="canManageQuadras"
      :open="isNovaQuadraOpen"
      @close="closeNovaQuadra"
      @created="handleQuadraCreated"
    />

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import SectionHeader from '../components/SectionHeader.vue';
import QuadraCard from '../components/QuadraCard.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';
import EmptyStateCard from '../components/EmptyStateCard.vue';
import NovaQuadraModal from '../components/modals/NovaQuadraModal.vue';
import { useAuth } from '../stores/auth';
import { quadrasService } from '../services/quadrasService';

const auth = useAuth();
const userRole = 'super_admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');
const canManageQuadras = computed(() =>
  ['admin', 'super_admin'].includes(userRole.toLowerCase()),
);

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras', active: true },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Administradores', icon: 'shield', href: '/admin/administradores' },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda' },
  { label: 'Eventos', icon: 'sparkle', href: '/admin/eventos' },
];

const generalItems = computed(() =>
  baseGeneralItems.filter((item) => item.label !== 'Administradores' || isSuperAdmin.value),
);

const supportItems = [{ label: 'Configura\u00e7\u00f5es', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho r\u00e1pido',
  description: 'Adicionar uma nova quadra em poucos cliques.',
  buttonLabel: 'Nova quadra',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});

const normalizeQuadra = (quadra, index) => ({
  id: quadra.id ?? quadra.uuid ?? quadra.codigo ?? index,
  name: quadra.name ?? quadra.nome ?? `Quadra ${String(index + 1).padStart(2, '0')}`,
  subtitle: quadra.sport ?? quadra.esporte ?? quadra.tipo ?? quadra.type ?? '---',
  status:
    quadra.status ??
    (quadra.ativa === false || quadra.ativo === false ? 'Manuten\u00e7\u00e3o' : 'Livre'),
  nextReservation:
    quadra.nextReservation ?? quadra.proxima_reserva ?? quadra.next_reservation ?? 'Sem reservas',
  nextReservationLabel: quadra.nextReservationLabel ?? 'Pr\u00f3xima',
  secondaryActionLabel: 'Ver detalhes',
  primaryActionLabel: 'Reservar',
});

const quadras = ref([]);
const isNovaQuadraOpen = ref(false);
const isQuadrasLoading = ref(true);

const loadQuadras = async () => {
  isQuadrasLoading.value = true;
  try {
    const payload = await quadrasService.listQuadras({ includeInactive: true });
    const data = payload?.data ?? payload ?? [];
    quadras.value = Array.isArray(data) ? data.map(normalizeQuadra) : [];
  } catch (error) {
    quadras.value = [];
  } finally {
    isQuadrasLoading.value = false;
  }
};

const openNovaQuadra = () => {
  if (!canManageQuadras.value) {
    return;
  }
  isNovaQuadraOpen.value = true;
};

const closeNovaQuadra = () => {
  isNovaQuadraOpen.value = false;
};

const resolveQuadraId = (quadra) =>
  quadra?.id ?? quadra?.quadra_id ?? quadra?.uuid ?? quadra?.codigo ?? null;

const handleQuadraCreated = async (created) => {
  const quadraId = resolveQuadraId(created);
  if (!quadraId) {
    await loadQuadras();
    return;
  }
  const newQuadra = normalizeQuadra(created, 0);
  quadras.value = [
    newQuadra,
    ...quadras.value.filter((item) => String(item.id) !== String(quadraId)),
  ];
  await loadQuadras();
};

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras', active: true },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Eventos', icon: 'sparkle', href: '/admin/eventos' },
  { label: 'Perfil', icon: 'user', href: '#' },
];

onMounted(() => {
  loadQuadras();
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

.dashboard-quadra-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
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
  .dashboard-quadra-grid {
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

  .dashboard-quadra-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }
}
</style>
