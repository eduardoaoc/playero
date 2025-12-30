<template>
  <teleport to="body">
    <transition name="alert-fade">
      <div v-if="alertState.isOpen" class="alert-overlay" @click="handleOverlayClick">
        <div
          class="alert-modal"
          :class="typeClass"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="alertState.message ? messageId : undefined"
          @click.stop
        >
          <div class="alert-header">
            <span class="alert-chip">{{ typeLabel }}</span>
            <h3 :id="titleId" class="alert-title">{{ alertState.title }}</h3>
          </div>

          <p v-if="alertState.message" :id="messageId" class="alert-message">
            {{ alertState.message }}
          </p>

          <div class="alert-actions">
            <button
              v-if="alertState.isConfirm"
              ref="cancelButton"
              class="alert-button alert-button--ghost"
              type="button"
              @click="handleCancel"
            >
              {{ alertState.cancelText || 'Cancelar' }}
            </button>
            <button
              ref="confirmButton"
              class="alert-button alert-button--primary"
              type="button"
              @click="handleConfirm"
            >
              {{ alertState.confirmText || 'Ok' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAlert } from '../../composables/useAlert';

const { alertState, confirmAlert, cancelAlert, closeAlert } = useAlert();

const confirmButton = ref(null);
const cancelButton = ref(null);
const lastFocusedElement = ref(null);

const titleId = 'alert-modal-title';
const messageId = 'alert-modal-message';

const typeLabels = {
  info: 'Info',
  success: 'Sucesso',
  warning: 'Atencao',
  error: 'Erro',
  confirm: 'Confirmar',
};

const typeLabel = computed(() => typeLabels[alertState.type] || 'Info');
const typeClass = computed(() => `is-${alertState.type || 'info'}`);

const handleConfirm = () => {
  if (alertState.isConfirm) {
    confirmAlert();
    return;
  }
  closeAlert();
};

const handleCancel = () => {
  cancelAlert();
};

const handleOverlayClick = () => {
  if (alertState.allowOutsideClick) {
    cancelAlert();
  }
};

const focusPrimary = () => {
  const target = confirmButton.value;
  if (target && typeof target.focus === 'function') {
    target.focus();
  }
};

const focusableButtons = () => [cancelButton.value, confirmButton.value].filter(Boolean);

const handleKeydown = (event) => {
  if (!alertState.isOpen) {
    return;
  }
  if (event.key === 'Escape' && alertState.allowEscape) {
    event.preventDefault();
    cancelAlert();
    return;
  }
  if (event.key !== 'Tab') {
    return;
  }

  const focusables = focusableButtons();
  if (!focusables.length) {
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const current = document.activeElement;

  if (event.shiftKey && current === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && current === last) {
    event.preventDefault();
    first.focus();
  }
};

watch(
  () => alertState.isOpen,
  async (isOpen, wasOpen) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (isOpen) {
      lastFocusedElement.value = document.activeElement;
      await nextTick();
      focusPrimary();
      return;
    }
    if (!isOpen && wasOpen && lastFocusedElement.value?.focus) {
      lastFocusedElement.value.focus();
      lastFocusedElement.value = null;
    }
  },
);

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 12, 0.62);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 9999;
}

.alert-modal {
  width: min(92vw, 520px);
  border-radius: 16px;
  background: rgba(15, 15, 18, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  color: #ffffff;
  padding: 22px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.alert-modal::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--alert-accent), transparent);
  opacity: 0.9;
  border-radius: 999px;
}

.alert-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-chip {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--alert-accent);
  border: 1px solid var(--alert-accent-soft);
  background: var(--alert-accent-soft);
}

.alert-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.alert-message {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.5;
  white-space: pre-line;
}

.alert-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.alert-button {
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.alert-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--alert-accent) 60%, transparent);
  outline-offset: 2px;
}

.alert-button--ghost {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.alert-button--primary {
  background: var(--alert-accent-strong);
  border-color: transparent;
  box-shadow: 0 12px 32px var(--alert-accent-shadow);
}

.alert-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
}

.alert-button:active {
  transform: translateY(0);
}

.is-info {
  --alert-accent: #7dd3fc;
  --alert-accent-strong: #2563eb;
  --alert-accent-soft: rgba(125, 211, 252, 0.18);
  --alert-accent-shadow: rgba(37, 99, 235, 0.35);
}

.is-success {
  --alert-accent: #34d399;
  --alert-accent-strong: #16a34a;
  --alert-accent-soft: rgba(52, 211, 153, 0.18);
  --alert-accent-shadow: rgba(22, 163, 74, 0.35);
}

.is-warning {
  --alert-accent: #fbbf24;
  --alert-accent-strong: #d97706;
  --alert-accent-soft: rgba(251, 191, 36, 0.2);
  --alert-accent-shadow: rgba(217, 119, 6, 0.35);
}

.is-error {
  --alert-accent: #fb7185;
  --alert-accent-strong: #ef4444;
  --alert-accent-soft: rgba(251, 113, 133, 0.2);
  --alert-accent-shadow: rgba(239, 68, 68, 0.35);
}

.is-confirm {
  --alert-accent: #60a5fa;
  --alert-accent-strong: #2563eb;
  --alert-accent-soft: rgba(96, 165, 250, 0.18);
  --alert-accent-shadow: rgba(37, 99, 235, 0.35);
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.22s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}

.alert-fade-enter-active .alert-modal,
.alert-fade-leave-active .alert-modal {
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.alert-fade-enter-from .alert-modal,
.alert-fade-leave-to .alert-modal {
  transform: scale(0.96);
  opacity: 0;
}

@media (max-width: 640px) {
  .alert-modal {
    padding: 20px 18px 16px;
  }

  .alert-actions {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .alert-fade-enter-active,
  .alert-fade-leave-active,
  .alert-fade-enter-active .alert-modal,
  .alert-fade-leave-active .alert-modal {
    transition: none;
  }

  .alert-button {
    transition: none;
  }
}
</style>
