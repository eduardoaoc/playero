<template>
  <div class="kpi-card">
    <div class="kpi-head">
      <p class="kpi-title">{{ title }}</p>
      <span class="kpi-icon">
        <DashboardIcon :name="icon" />
      </span>
    </div>
    <div class="kpi-value">{{ value }}</div>
    <p class="kpi-meta">{{ meta }}</p>
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
  border-radius: var(--dash-radius, 18px);
  padding: 20px 22px;
  box-shadow: var(--dash-shadow, 0 18px 40px -30px rgba(15, 23, 42, 0.35));
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kpi-title {
  margin: 0;
  font-size: 0.95rem;
  color: var(--dash-muted, #64748b);
}

.kpi-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid var(--dash-border, #e6e9ef);
  color: var(--dash-text, #0f172a);
  background: var(--dash-surface-soft, #f6f8fb);
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dash-text, #0f172a);
}

.kpi-meta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
}
</style>

