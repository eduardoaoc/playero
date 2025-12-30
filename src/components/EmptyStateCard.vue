<template>
  <div class="empty-card" role="status" aria-live="polite">
    <div v-if="icon" class="empty-icon" aria-hidden="true">
      <DashboardIcon :name="icon" :size="22" />
    </div>
    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <button
        v-if="actionLabel"
        class="empty-action"
        type="button"
        :disabled="!canAction"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DashboardIcon from './DashboardIcon.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
  actionCallback: {
    type: Function,
    default: null,
  },
});

const canAction = computed(() => typeof props.actionCallback === 'function');

const handleAction = () => {
  if (canAction.value) {
    props.actionCallback();
  }
};
</script>

<style scoped>
.empty-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-muted, #64748b);
}

.empty-content {
  display: flex;
  flex-direction: column;
}

.empty-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.empty-description {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
}

.empty-action {
  margin-top: 14px;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 18px 40px -28px var(--dash-primary-soft, rgba(255, 122, 0, 0.45));
}

.empty-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 640px) {
  .empty-card {
    flex-direction: column;
  }
}
</style>
