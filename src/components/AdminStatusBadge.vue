<template>
  <span class="admin-status" :class="statusClass">
    <span class="admin-status-dot" aria-hidden="true"></span>
    {{ labelText }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: [Boolean, String, Number],
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
});

const isActive = computed(() => {
  if (typeof props.status === 'boolean') {
    return props.status;
  }
  if (typeof props.status === 'number') {
    return props.status === 1;
  }
  const raw = String(props.status || '').toLowerCase();
  return ['ativo', 'active', 'true', '1'].includes(raw);
});

const labelText = computed(() => props.label || (isActive.value ? 'Ativo' : 'Inativo'));
const statusClass = computed(() => (isActive.value ? 'admin-status--active' : 'admin-status--inactive'));
</script>

<style scoped>
.admin-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.admin-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
}

.admin-status--active {
  background: var(--dash-success-soft, rgba(22, 163, 74, 0.2));
  color: var(--dash-success, #16a34a);
  border-color: rgba(22, 163, 74, 0.25);
}

.admin-status--inactive {
  background: var(--dash-danger-soft, rgba(239, 68, 68, 0.18));
  color: var(--dash-danger, #ef4444);
  border-color: rgba(239, 68, 68, 0.22);
}
</style>
