<template>
  <nav class="mobile-nav">
    <a
      v-for="item in items"
      :key="item.label"
      :href="item.href"
      class="mobile-nav-item"
      :class="{ 'is-active': item.active }"
    >
      <DashboardIcon :name="item.icon" :size="18" />
      <span>{{ item.label }}</span>
    </a>
  </nav>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--dash-mobile-nav-height, 72px);
  background: var(--dash-surface, #ffffff);
  border-top: 1px solid var(--dash-border, #e6e9ef);
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 8px 12px;
  z-index: 85;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--dash-muted, #64748b);
}

.mobile-nav-item.is-active {
  color: var(--dash-primary, #ff7a00);
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
  }
}
</style>


