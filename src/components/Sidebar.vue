<template>
  <aside class="dashboard-sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <span class="sidebar-logo-dot"></span>
      </div>
      <div class="sidebar-brand-text">
        <h1 class="sidebar-title">{{ brand.name }}</h1>
        <p class="sidebar-subtitle">{{ brand.role }}</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      <p class="sidebar-section">{{ generalLabel }}</p>
      <a
        v-for="item in generalItems"
        :key="item.label"
        :href="item.href"
        class="sidebar-item"
        :class="{ 'is-active': item.active }"
      >
        <span class="sidebar-item-icon">
          <DashboardIcon :name="item.icon" :size="16" />
        </span>
        <span>{{ item.label }}</span>
      </a>

      <p class="sidebar-section">{{ supportLabel }}</p>
      <a
        v-for="item in supportItems"
        :key="item.label"
        :href="item.href"
        class="sidebar-item"
        :class="{ 'is-active': item.active }"
      >
        <span class="sidebar-item-icon">
          <DashboardIcon :name="item.icon" :size="16" />
        </span>
        <span>{{ item.label }}</span>
      </a>
    </nav>

  </aside>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';

defineProps({
  brand: {
    type: Object,
    default: () => ({
      name: '',
      role: '',
    }),
  },
  generalLabel: {
    type: String,
    default: 'GERAL',
  },
  supportLabel: {
    type: String,
    default: 'SUPORTE',
  },
  generalItems: {
    type: Array,
    default: () => [],
  },
  supportItems: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.dashboard-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--dash-sidebar-width, 280px);
  background: var(--dash-surface, #ffffff);
  border-right: 1px solid var(--dash-border, #e6e9ef);
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  z-index: 80;
  scrollbar-width: thin;
  scrollbar-color: var(--dash-primary, #ff7a00) transparent;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 2px;
}

.sidebar-logo {
  width: 44px;
  height: 44px;
  border-radius: 18px;
  background: var(--dash-soft, #f1f4f9);
  display: grid;
  place-items: center;
}

.sidebar-logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--dash-primary, #ff7a00);
  box-shadow: 0 0 0 8px var(--dash-primary-soft, rgba(255, 122, 0, 0.12));
}

.sidebar-brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.sidebar-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-section {
  margin: 6px 4px 2px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--dash-muted, #64748b);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  color: var(--dash-text, #0f172a);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-item-icon {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: var(--dash-soft, #f1f4f9);
  color: var(--dash-muted, #64748b);
}

.sidebar-item.is-active {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
}

.sidebar-item.is-active .sidebar-item-icon {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.sidebar-item:not(.is-active):hover {
  background: rgba(255, 255, 255, 0.04);
}


.dashboard-sidebar::-webkit-scrollbar {
  width: 6px;
}

.dashboard-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-sidebar::-webkit-scrollbar-thumb {
  background: var(--dash-primary-soft, rgba(255, 122, 0, 0.3));
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.dashboard-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--dash-primary, #ff7a00);
}

@media (max-width: 1024px) {
  .dashboard-sidebar {
    display: none;
  }
}
</style>


