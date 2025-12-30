<template>
  <div class="table-card">
    <div class="table-header">
      <div>
        <h3 class="table-title">Todos os administradores</h3>
        <p class="table-subtitle">Lista completa com roles e status.</p>
      </div>
      <div class="table-legend">
        <span class="legend-item">
          <span class="legend-dot legend-dot--active"></span>
          Ativo
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-dot--inactive"></span>
          Inativo
        </span>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="admins-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>A&#231;&#245;es</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="table-empty">Carregando administradores...</td>
          </tr>
          <tr v-else-if="!admins.length">
            <td colspan="6" class="table-empty">Nenhum administrador encontrado.</td>
          </tr>
          <tr v-for="admin in admins" :key="admin.id">
            <td>
              <div class="admin-name">
                <span class="admin-avatar">{{ avatarInitial(admin) }}</span>
                <div>
                  <p class="admin-primary">{{ admin.name }}</p>
                  <p class="admin-secondary">ID {{ admin.id }}</p>
                </div>
              </div>
            </td>
            <td class="admin-info">{{ admin.email }}</td>
            <td class="admin-role">{{ admin.role }}</td>
            <td>
              <AdminStatusBadge :status="admin.isActive" />
            </td>
            <td>
              <div v-if="canManage" class="action-buttons">
                <button class="action-button" type="button" @click="$emit('edit', admin)">
                  <DashboardIcon name="settings" :size="14" />
                  Editar
                </button>
                <button class="action-button" type="button" @click="$emit('toggle-status', admin)">
                  <DashboardIcon :name="admin.isActive ? 'ban' : 'check'" :size="14" />
                  {{ admin.isActive ? 'Desativar' : 'Ativar' }}
                </button>
                <button class="action-button action-button--danger" type="button" @click="$emit('delete', admin)">
                  <DashboardIcon name="x" :size="14" />
                  Excluir
                </button>
              </div>
              <span v-else class="table-muted">Sem permiss&#227;o</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import AdminStatusBadge from './AdminStatusBadge.vue';
import DashboardIcon from './DashboardIcon.vue';

defineProps({
  admins: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canManage: {
    type: Boolean,
    default: false,
  },
});

const avatarInitial = (admin) => {
  const name = admin?.name || admin?.email || '';
  return name ? name.charAt(0).toUpperCase() : '-';
};
</script>

<style scoped>
.table-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
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

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-dot--active {
  background: var(--dash-success, #16a34a);
}

.legend-dot--inactive {
  background: var(--dash-danger, #ef4444);
}

.table-wrapper {
  overflow-x: auto;
}

.admins-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
}

.admins-table th,
.admins-table td {
  text-align: left;
  padding: 14px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
  vertical-align: middle;
}

.admins-table th {
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

.table-muted {
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.admin-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: var(--dash-primary-soft, rgba(255, 122, 0, 0.15));
  color: var(--dash-primary, #ff7a00);
  font-weight: 700;
  display: grid;
  place-items: center;
}

.admin-primary {
  margin: 0;
  font-weight: 600;
}

.admin-secondary {
  margin: 0;
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

.admin-info {
  color: var(--dash-muted, #64748b);
}

.admin-role {
  text-transform: uppercase;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
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

@media (max-width: 768px) {
  .table-legend {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
