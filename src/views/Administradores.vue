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
          <SectionHeader title="Administradores" subtitle="Gestao de administradores">
            <template #actions>
              <button
                v-if="isSuperAdmin"
                class="dash-action dash-action--primary"
                type="button"
                @click="openCreateModal"
              >
                <DashboardIcon name="user-plus" />
                Criar novo administrador
              </button>
            </template>
          </SectionHeader>

          <div v-if="!isSuperAdmin" class="access-card">
            <div class="access-icon">
              <DashboardIcon name="shield" />
            </div>
            <div>
              <h3 class="access-title">Area restrita</h3>
              <p class="access-text">
                Apenas usuarios com perfil super_admin podem gerenciar administradores.
              </p>
            </div>
          </div>

          <template v-else>
            <AdministradoresTable
              :admins="admins"
              :loading="loading"
              :can-manage="isSuperAdmin"
              @edit="openEditModal"
              @toggle-status="handleToggleStatus"
              @delete="openDeleteModal"
            />
          </template>
        </section>
      </div>
    </main>

    <ModalCriarAdmin
      v-if="isSuperAdmin"
      :open="isCreateModalOpen"
      :is-saving="isSaving"
      @close="closeCreateModal"
      @submit="handleCreateAdmin"
    />

    <ModalEditarAdmin
      v-if="isSuperAdmin"
      :open="isEditModalOpen"
      :admin="selectedAdmin"
      :is-saving="isSaving"
      @close="closeEditModal"
      @submit="handleUpdateAdmin"
    />

    <div v-if="isDeleteModalOpen" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-card modal-card--small" @click.stop>
        <header class="modal-header">
          <div>
            <p class="modal-eyebrow">Confirmar exclusao</p>
            <h3 class="modal-title">Excluir administrador</h3>
          </div>
          <button class="modal-close" type="button" @click="closeDeleteModal">
            <DashboardIcon name="x" />
          </button>
        </header>
        <div class="modal-body">
          <p class="modal-text">
            Tem certeza que deseja excluir
            <strong>{{ selectedAdmin?.name || 'este administrador' }}</strong>? Essa acao e irreversivel.
          </p>
          <div class="modal-actions">
            <button class="dash-action dash-action--ghost" type="button" @click="closeDeleteModal">
              Cancelar
            </button>
            <button class="dash-action dash-action--danger" type="button" :disabled="isDeleting" @click="handleDeleteAdmin">
              <span v-if="isDeleting">Excluindo...</span>
              <span v-else>Excluir administrador</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <MobileNav :items="mobileNav" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import SectionHeader from '../components/SectionHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import DashboardIcon from '../components/DashboardIcon.vue';
import AdministradoresTable from '../components/AdministradoresTable.vue';
import ModalCriarAdmin from '../components/modals/ModalCriarAdmin.vue';
import ModalEditarAdmin from '../components/modals/ModalEditarAdmin.vue';
import { adminsService } from '../services/adminsService';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const userRole = 'super_admin';
const isSuperAdmin = computed(() => userRole === 'super_admin');

const brand = computed(() => ({
  name: 'Playero',
  role: auth.user.value?.role ?? auth.user.value?.perfil ?? auth.user.value?.tipo ?? 'Admin Geral',
}));

const baseGeneralItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Quadras', icon: 'grid', href: '/admin/quadras' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Administradores', icon: 'shield', href: '/admin/administradores', active: true },
  { label: 'Agenda', icon: 'calendar', href: '/admin/agenda' },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
];

const generalItems = computed(() =>
  baseGeneralItems.filter((item) => item.label !== 'Administradores' || isSuperAdmin.value),
);

const supportItems = [{ label: 'Configuracoes', icon: 'settings', href: '#' }];

const quickAction = {
  title: 'Atalho rapido',
  description: 'Criar um novo administrador rapidamente.',
  buttonLabel: 'Novo administrador',
  href: '#',
};

const sidebarUser = computed(() => {
  const user = auth.user.value || {};
  return {
    name: user.name ?? user.nome ?? 'Admin',
    role: user.role ?? user.perfil ?? user.tipo ?? 'Geral',
  };
});

const useMock = true;
const loading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const admins = ref([]);
const selectedAdminId = ref(null);
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

const selectedAdmin = computed(
  () => admins.value.find((admin) => admin.id === selectedAdminId.value) || null,
);

const mockAdmins = [
  {
    id: 1,
    name: 'Marina Silva',
    email: 'marina@playero.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-12-04T10:20:00',
  },
  {
    id: 2,
    name: 'Rafael Souza',
    email: 'rafael@playero.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-11-18T08:10:00',
  },
  {
    id: 3,
    name: 'Bruna Reis',
    email: 'bruna@playero.com',
    role: 'admin',
    is_active: false,
    created_at: '2024-10-29T14:40:00',
  },
];

const normalizeAdmin = (admin, index) => ({
  id: admin.id ?? admin.uuid ?? index,
  name: admin.name ?? admin.nome ?? `Admin ${String(index + 1).padStart(2, '0')}`,
  email: admin.email ?? 'admin@playero.com',
  role: admin.role ?? admin.perfil ?? 'admin',
  isActive: admin.is_active ?? admin.isActive ?? admin.ativo ?? true,
  createdAt: admin.created_at ?? admin.createdAt ?? new Date().toISOString(),
});

const loadAdmins = async () => {
  if (!isSuperAdmin.value) {
    return;
  }
  loading.value = true;
  try {
    if (useMock) {
      admins.value = mockAdmins.map(normalizeAdmin);
      return;
    }
    const payload = await adminsService.listAdmins();
    const data = payload?.data ?? payload ?? [];
    admins.value = data.map(normalizeAdmin);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  if (!isSuperAdmin.value) {
    return;
  }
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const openEditModal = (admin) => {
  if (!isSuperAdmin.value || !admin) {
    return;
  }
  selectedAdminId.value = admin.id;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const openDeleteModal = (admin) => {
  if (!isSuperAdmin.value || !admin) {
    return;
  }
  selectedAdminId.value = admin.id;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
};

const handleCreateAdmin = async (payload) => {
  if (!isSuperAdmin.value) {
    return;
  }
  isSaving.value = true;
  try {
    let createdAdmin = null;
    if (useMock) {
      createdAdmin = normalizeAdmin(
        {
          id: Date.now(),
          name: payload.name,
          email: payload.email,
          role: 'admin',
          is_active: payload.is_active,
          created_at: new Date().toISOString(),
        },
        admins.value.length,
      );
    } else {
      const response = await adminsService.createAdmin(payload);
      createdAdmin = normalizeAdmin(response, admins.value.length);
    }
    if (createdAdmin) {
      admins.value = [createdAdmin, ...admins.value];
    }
    closeCreateModal();
  } finally {
    isSaving.value = false;
  }
};

const handleUpdateAdmin = async (payload) => {
  if (!isSuperAdmin.value || !selectedAdmin.value) {
    return;
  }
  isSaving.value = true;
  try {
    const adminId = selectedAdmin.value.id;
    if (!useMock) {
      await adminsService.updateAdmin(adminId, payload);
    }
    admins.value = admins.value.map((admin) =>
      admin.id === adminId
        ? {
            ...admin,
            name: payload.name ?? admin.name,
            email: payload.email ?? admin.email,
            isActive: payload.is_active ?? admin.isActive,
          }
        : admin,
    );
    closeEditModal();
  } finally {
    isSaving.value = false;
  }
};

const handleToggleStatus = async (admin) => {
  if (!isSuperAdmin.value || !admin) {
    return;
  }
  const nextStatus = !admin.isActive;
  if (!useMock) {
    await adminsService.updateStatus(admin.id, { is_active: nextStatus });
  }
  admins.value = admins.value.map((item) =>
    item.id === admin.id ? { ...item, isActive: nextStatus } : item,
  );
};

const handleDeleteAdmin = async () => {
  if (!isSuperAdmin.value || !selectedAdmin.value) {
    return;
  }
  isDeleting.value = true;
  try {
    if (!useMock) {
      await adminsService.deleteAdmin(selectedAdmin.value.id);
    }
    admins.value = admins.value.filter((admin) => admin.id !== selectedAdmin.value.id);
    closeDeleteModal();
  } finally {
    isDeleting.value = false;
  }
};

const mobileNav = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Clientes', icon: 'users', href: '/admin/clientes' },
  { label: 'Reservas', icon: 'calendar-check', href: '/admin/reservas' },
  { label: 'Eventos', icon: 'sparkle', href: '#' },
  { label: 'Perfil', icon: 'user', href: '#' },
];

onMounted(() => {
  loadAdmins();
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
  max-width: 520px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg);
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.modal-card--small {
  max-width: 520px;
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

.modal-text {
  margin: 0;
  color: var(--dash-text, #0f172a);
  font-size: 0.95rem;
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
    padding-bottom: calc(var(--dash-mobile-nav-height) + 32px);
  }

  .dashboard-content {
    padding: 0 18px 80px;
  }

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
