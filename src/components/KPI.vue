<template>
  <div class="kpi-card">
    <span class="kpi-icon">
      <DashboardIcon :name="icon" :size="16" />
    </span>
    <span class="kpi-text">
      <span class="kpi-title">{{ title }}</span>
      <span class="kpi-meta">{{ meta }}</span>
    </span>
    <span class="kpi-value">{{ value }}</span>
  </div>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Number],
    default: '',
  },
  meta: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'dashboard',
  },
});
</script>

<style scoped>
.kpi-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: var(--dash-shadow, 0 18px 40px -32px rgba(15, 23, 42, 0.35));
  display: flex;
  align-items: center;
  gap: 10px;
}

.kpi-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  border: 1px solid var(--dash-border, #e6e9ef);
  color: var(--dash-text, #0f172a);
  background: var(--dash-surface-soft, #f6f8fb);
}

.kpi-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.kpi-value {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--dash-text, #0f172a);
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  flex-shrink: 0;
}

.kpi-meta {
  font-size: 0.7rem;
  color: var(--dash-muted, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 520px) {
  .kpi-meta {
    display: none;
  }
}
</style>

