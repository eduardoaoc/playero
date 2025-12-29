<template>
  <span class="reserva-status" :class="[toneClass, { 'is-compact': compact }]">
    <span class="reserva-status-icon">
      <DashboardIcon :name="iconName" :size="12" :stroke-width="2" />
    </span>
    <span class="reserva-status-label">{{ labelText }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';
import DashboardIcon from './DashboardIcon.vue';

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const normalizedStatus = computed(() => (props.status || '').toString().trim().toLowerCase());

const statusMap = {
  confirmada: { tone: 'success', icon: 'check', label: 'Confirmada' },
  paga: { tone: 'success', icon: 'check', label: 'Confirmada' },
  'pre-reserva': { tone: 'warning', icon: 'clock', label: 'Pre-reserva' },
  prereserva: { tone: 'warning', icon: 'clock', label: 'Pre-reserva' },
  'pre_reserva': { tone: 'warning', icon: 'clock', label: 'Pre-reserva' },
  cancelada: { tone: 'danger', icon: 'x', label: 'Cancelada' },
};

const statusConfig = computed(() => statusMap[normalizedStatus.value] || { tone: 'neutral', icon: 'clock', label: props.status });
const toneClass = computed(() => `reserva-status--${statusConfig.value.tone}`);
const iconName = computed(() => statusConfig.value.icon);
const labelText = computed(() => props.label || statusConfig.value.label || props.status || '---');
</script>

<style scoped>
.reserva-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.reserva-status.is-compact {
  padding: 4px 8px;
  font-size: 0.62rem;
  letter-spacing: 0.06em;
}

.reserva-status-icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.12);
}

.reserva-status.is-compact .reserva-status-icon {
  width: 14px;
  height: 14px;
}

.reserva-status--success {
  background: var(--dash-success-soft, #e6f7ee);
  color: var(--dash-success, #16a34a);
  border-color: rgba(22, 163, 74, 0.3);
}

.reserva-status--warning {
  background: var(--dash-warning-soft, #fff4df);
  color: var(--dash-warning, #f59e0b);
  border-color: rgba(245, 158, 11, 0.35);
}

.reserva-status--danger {
  background: var(--dash-danger-soft, #ffe8ea);
  color: var(--dash-danger, #ef4444);
  border-color: rgba(239, 68, 68, 0.35);
}

.reserva-status--neutral {
  background: var(--dash-soft, #f1f4f9);
  color: var(--dash-muted, #64748b);
  border-color: var(--dash-border, #e6e9ef);
}
</style>
