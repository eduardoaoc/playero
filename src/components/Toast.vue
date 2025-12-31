<template>
  <div class="toast-viewport" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div" class="toast-stack">
      <div v-for="item in toastState.items" :key="item.id" class="toast-card" :class="toneClass(item)">
        <span class="toast-icon">
          <DashboardIcon :name="iconName(item)" :size="16" />
        </span>
        <div class="toast-content">
          <p class="toast-title">{{ resolveTitle(item) }}</p>
          <p class="toast-message">{{ item.message }}</p>
        </div>
        <button class="toast-close" type="button" @click="remove(item.id)">
          <DashboardIcon name="x" :size="14" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import DashboardIcon from './DashboardIcon.vue';
import { useToast } from '../composables/useToast';

const { toastState, remove } = useToast();

const toneMap = {
  success: {
    title: 'Sucesso',
    icon: 'check',
    className: 'toast-card--success',
  },
  error: {
    title: 'Erro',
    icon: 'x',
    className: 'toast-card--error',
  },
  info: {
    title: 'Info',
    icon: 'bell',
    className: 'toast-card--info',
  },
};

const resolveTitle = (item) => item.title || toneMap[item.type]?.title || 'Aviso';
const iconName = (item) => toneMap[item.type]?.icon || 'bell';
const toneClass = (item) => toneMap[item.type]?.className || 'toast-card--info';
</script>

<style scoped>
.toast-viewport {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 140;
  pointer-events: none;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast-card {
  pointer-events: auto;
  min-width: 260px;
  max-width: 360px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 15, 18, 0.88);
  box-shadow: 0 30px 70px -50px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(16px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.toast-card--success {
  --toast-accent: #4caf50;
}

.toast-card--error {
  --toast-accent: #ff5f6b;
}

.toast-card--info {
  --toast-accent: #ff7a00;
}

.toast-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  color: var(--toast-accent, #ff7a00);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.toast-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toast-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f7f7f8;
}

.toast-message {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
}

.toast-close {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .toast-viewport {
    left: 14px;
    right: 14px;
    top: 12px;
  }

  .toast-card {
    max-width: none;
  }
}
</style>
