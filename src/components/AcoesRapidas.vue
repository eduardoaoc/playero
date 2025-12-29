<template>
  <div class="acoes-card">
    <h3 class="acoes-title">{{ title }}</h3>
    <div class="acoes-list">
      <a
        v-for="item in items"
        :key="item.label"
        :href="item.href || '#'"
        class="acoes-item"
        @click="handleAction(item, $event)"
      >
        <span class="acoes-icon">
          <DashboardIcon :name="item.icon" />
        </span>
        <span class="acoes-label">{{ item.label }}</span>
        <span class="acoes-chevron">
          <DashboardIcon name="arrow-up-right" :size="16" />
        </span>
      </a>
    </div>
  </div>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';

const handleAction = (item, event) => {
  if (typeof item?.action === 'function') {
    event.preventDefault();
    item.action();
  }
};

defineProps({
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.acoes-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 20px;
  box-shadow: var(--dash-shadow, 0 18px 40px -30px rgba(15, 23, 42, 0.35));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.acoes-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.acoes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.acoes-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  text-decoration: none;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid transparent;
  color: var(--dash-text, #0f172a);
  font-weight: 500;
  font-size: 0.9rem;
}

.acoes-icon {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  color: var(--dash-muted, #64748b);
}

.acoes-chevron {
  margin-left: auto;
  color: var(--dash-muted, #64748b);
}
</style>

