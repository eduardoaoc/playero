<template>
  <aside class="dashboard-sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <img src="/images/logo-text.png" alt="Playero" class="sidebar-logo-image" />
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

    <div v-if="user?.name" ref="userMenuRef" class="sidebar-user-wrap">
      <button
        class="sidebar-user"
        type="button"
        :aria-expanded="isMenuOpen"
        @click.stop="toggleMenu"
      >
        <span class="sidebar-user-avatar"></span>
        <span class="sidebar-user-text">
          <span class="sidebar-user-name">{{ user.name }}</span>
          <span class="sidebar-user-role">{{ user.role }}</span>
        </span>
        <DashboardIcon
          name="chevron-down"
          :size="16"
          class="sidebar-user-chevron"
          :class="{ 'is-open': isMenuOpen }"
        />
      </button>

      <div v-if="isMenuOpen" class="sidebar-user-menu" @click.stop>
        <button class="sidebar-user-action" type="button" @click="handleLogout">
          <DashboardIcon name="logout" :size="16" />
          Sair
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
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
  user: {
    type: Object,
    default: null,
  },
});

const router = useRouter();
const isMenuOpen = ref(false);
const userMenuRef = ref(null);

const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  router.push('/login');
};

const handleLogout = () => {
  isMenuOpen.value = false;
  logout();
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleOutsideClick = (event) => {
  if (!userMenuRef.value) {
    return;
  }
  if (!userMenuRef.value.contains(event.target)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
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
  overflow: hidden;
  z-index: 80;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 2px;
}

.sidebar-logo {
  width: 150px;
  height: 95%;
  border-radius: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
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

.sidebar-user-wrap {
  margin-top: auto;
  position: relative;
}

.sidebar-user {
  padding: 12px 12px;
  border-radius: 16px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.sidebar-user-chevron {
  transition: transform 0.2s ease;
}

.sidebar-user-chevron.is-open {
  transform: rotate(180deg);
}

.sidebar-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: var(--dash-primary-soft, rgba(255, 122, 0, 0.15));
}

.sidebar-user-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar-user-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.sidebar-user-role {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.sidebar-user-menu {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  min-width: 180px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
  display: grid;
  gap: 6px;
  z-index: 10;
}

.sidebar-user-action {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface, #ffffff);
  color: var(--dash-text, #0f172a);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sidebar-user-action:hover {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  border-color: transparent;
}

@media (max-width: 1024px) {
  .dashboard-sidebar {
    display: none;
  }
}
</style>

