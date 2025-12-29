<template>
  <span class="status-badge" :class="toneClass">
    <span class="status-icon">
      <DashboardIcon :name="iconName" :size="14" :stroke-width="2" />
    </span>
    {{ labelText }}
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
});

const normalizedStatus = computed(() => (props.status || '').toLowerCase());

const statusMap = {
  livre: { tone: 'success', icon: 'check', label: 'Livre' },
  reservada: { tone: 'warning', icon: 'clock', label: 'Reservada' },
  manutencao: { tone: 'danger', icon: 'x', label: 'Manutenção' },
  'manutenção': { tone: 'danger', icon: 'x', label: 'Manutenção' },
};

const statusConfig = computed(() => statusMap[normalizedStatus.value] || { tone: 'neutral', icon: 'clock', label: props.status });

const toneClass = computed(() => `status-badge--${statusConfig.value.tone}`);
const iconName = computed(() => statusConfig.value.icon);
const labelText = computed(() => props.label || statusConfig.value.label || props.status);
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.status-icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.12);
}

.status-badge--success {
  background: var(--dash-success-soft, #e6f7ee);
  color: var(--dash-success, #15a34a);
  border-color: rgba(21, 163, 74, 0.25);
}

.status-badge--warning {
  background: var(--dash-warning-soft, #fff4df);
  color: var(--dash-warning, #f59e0b);
  border-color: rgba(245, 158, 11, 0.3);
}

.status-badge--danger {
  background: var(--dash-danger-soft, #ffe8ea);
  color: var(--dash-danger, #ef4444);
  border-color: rgba(239, 68, 68, 0.3);
}

.status-badge--neutral {
  background: var(--dash-soft, #f1f4f9);
  color: var(--dash-muted, #64748b);
  border-color: var(--dash-border, #e6e9ef);
}
</style>

