<template>
  <header class="dashboard-topbar">
    <div class="topbar-title">
      <h1 class="topbar-heading">{{ title }}</h1>
      <p class="topbar-subtitle">{{ subtitle }}</p>
    </div>

    <div class="topbar-actions">
      <label class="topbar-search">
        <span class="topbar-search-icon">
          <DashboardIcon name="search" />
        </span>
        <input type="search" :placeholder="searchPlaceholder" />
      </label>

      <button v-if="showThemeToggle" class="topbar-toggle" type="button">
        <span class="topbar-toggle-dot"></span>
        {{ themeLabel }}
      </button>

      <button class="topbar-icon-button" type="button">
        <DashboardIcon name="bell" />
      </button>

      <button class="topbar-user" type="button">
        <span class="topbar-avatar"></span>
        <span class="topbar-user-text">
          <span class="topbar-user-name">{{ user.name }}</span>
          <span class="topbar-user-role">{{ user.role }}</span>
        </span>
        <DashboardIcon name="chevron-down" />
      </button>
    </div>
  </header>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar...',
  },
  user: {
    type: Object,
    default: () => ({
      name: '',
      role: '',
    }),
  },
  showThemeToggle: {
    type: Boolean,
    default: true,
  },
  themeLabel: {
    type: String,
    default: 'Light',
  },
});
</script>

<style scoped>
.dashboard-topbar {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--dash-sidebar-width, 280px);
  min-height: var(--dash-topbar-height, 96px);
  padding: 20px 32px;
  background: var(--dash-surface, #ffffff);
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  z-index: 90;
}

.topbar-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.topbar-heading {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.topbar-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--dash-muted, #64748b);
  line-height: 1.4;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.topbar-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  min-width: 260px;
  box-shadow: var(--dash-shadow-soft, 0 10px 30px -20px rgba(15, 23, 42, 0.2));
}

.topbar-search-icon {
  color: var(--dash-muted, #64748b);
  display: flex;
}

.topbar-search input {
  border: none;
  outline: none;
  font-size: 0.95rem;
  width: 100%;
  color: var(--dash-text, #0f172a);
  background: transparent;
}

.topbar-search input::placeholder {
  color: var(--dash-muted, #64748b);
}

.topbar-toggle {
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.topbar-toggle-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--dash-text, #0f172a);
  display: inline-block;
}

.topbar-icon-button {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  display: grid;
  place-items: center;
  color: var(--dash-muted, #64748b);
  cursor: pointer;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
  cursor: pointer;
}

.topbar-avatar {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: var(--dash-primary-soft, #e8f2ff);
}

.topbar-user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.topbar-user-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.topbar-user-role {
  font-size: 0.8rem;
  color: var(--dash-muted, #64748b);
}

@media (max-width: 1024px) {
  .dashboard-topbar {
    left: 0;
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .dashboard-topbar {
    padding: 18px 20px;
  }

  .topbar-actions {
    gap: 10px;
  }

  .topbar-search {
    min-width: 100%;
  }

  .topbar-user {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

