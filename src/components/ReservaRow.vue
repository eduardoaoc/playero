<template>
  <tr>
    <td class="table-id">#{{ reserva.id }}</td>
    <td>
      <div class="client-cell">
        <span class="client-avatar">{{ reserva.clienteInitial }}</span>
        <div>
          <p class="client-name">{{ reserva.clienteNome }}</p>
          <p class="client-email">{{ reserva.clienteEmail }}</p>
        </div>
      </div>
    </td>
    <td class="table-muted">{{ reserva.quadra }}</td>
    <td class="table-muted">{{ reserva.dataLabel }}</td>
    <td class="table-muted">{{ reserva.horario }}</td>
    <td>
      <ReservaStatusBadge :status="reserva.statusKey" />
    </td>
    <td class="table-muted">{{ reserva.pagamentoLabel }}</td>
    <td class="table-muted">{{ reserva.valorLabel }}</td>
    <td>
      <div class="action-buttons">
        <button class="action-button" type="button" @click="$emit('view', reserva)">
          <DashboardIcon name="arrow-up-right" :size="16" />
          Ver detalhes
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';
import ReservaStatusBadge from './ReservaStatusBadge.vue';

defineProps({
  reserva: {
    type: Object,
    required: true,
  },
});

defineEmits(['view']);
</script>

<style scoped>
.table-id {
  font-weight: 600;
}

.table-muted {
  color: var(--dash-muted, #64748b);
}

.client-cell {
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

.client-name {
  margin: 0;
  font-weight: 600;
}

.client-email {
  margin: 0;
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
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
</style>
