<template>
  <div class="table-card">
    <div class="table-header">
      <div>
        <h3 class="table-title">Bloqueios manuais</h3>
        <p class="table-subtitle">Controle de indisponibilidades programadas.</p>
      </div>
      <span class="table-tag">{{ blockings.length }} bloqueios</span>
    </div>

    <div class="table-wrapper">
      <table class="blockings-table">
        <thead>
          <tr>
            <th>Quadra</th>
            <th>Data</th>
            <th>Hora inicio</th>
            <th>Hora fim</th>
            <th>Motivo</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="table-empty">Carregando bloqueios...</td>
          </tr>
          <tr v-else-if="!blockings.length">
            <td colspan="6" class="table-empty">Nenhum bloqueio manual cadastrado.</td>
          </tr>
          <tr v-for="blocking in blockings" :key="blocking.id">
            <td class="table-strong">{{ blocking.quadraLabel }}</td>
            <td>{{ blocking.dataLabel }}</td>
            <td>{{ blocking.horaInicio }}</td>
            <td>{{ blocking.horaFim }}</td>
            <td class="table-muted">{{ blocking.motivo || '---' }}</td>
            <td>
              <button
                class="action-button action-button--danger"
                type="button"
                :disabled="!canManage"
                @click="$emit('delete', blocking)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  blockings: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canManage: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['delete']);
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

.table-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--dash-muted, #64748b);
}

.table-wrapper {
  overflow-x: auto;
}

.blockings-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.blockings-table th,
.blockings-table td {
  text-align: left;
  padding: 14px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
  vertical-align: middle;
}

.blockings-table th {
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

.table-strong {
  font-weight: 600;
}

.table-muted {
  color: var(--dash-muted, #64748b);
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

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
