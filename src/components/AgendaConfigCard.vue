<template>
  <div class="config-card">
    <div class="config-header">
      <div>
        <p class="config-eyebrow">Configuracao geral</p>
        <h3 class="config-title">Agenda principal</h3>
      </div>
      <span class="config-status" :class="{ 'is-loading': isLoading }">
        {{ isLoading ? 'Carregando' : 'Atualizado' }}
      </span>
    </div>

    <div v-if="isLoading" class="config-empty">
      Carregando configuracao da agenda...
    </div>
    <div v-else class="config-grid">
      <div class="config-item">
        <span class="config-label">Hora de abertura</span>
        <strong class="config-value">{{ config.hora_abertura || '--:--' }}</strong>
      </div>
      <div class="config-item">
        <span class="config-label">Hora de fechamento</span>
        <strong class="config-value">{{ config.hora_fechamento || '--:--' }}</strong>
      </div>
      <div class="config-item">
        <span class="config-label">Duracao padrao</span>
        <strong class="config-value">{{ durationLabel }}</strong>
      </div>
      <div class="config-item">
        <span class="config-label">Timezone</span>
        <strong class="config-value">{{ config.timezone || '---' }}</strong>
      </div>
      <div class="config-item config-item--wide">
        <span class="config-label">Dias ativos</span>
        <div class="day-pills">
          <span
            v-for="day in weekDays"
            :key="day.value"
            class="day-pill"
            :class="{ 'is-active': activeDays.includes(day.value) }"
          >
            {{ day.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    default: () => ({}),
  },
  weekDays: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const activeDays = computed(() => props.config?.dias_semana_ativos ?? []);
const durationLabel = computed(() => {
  const minutes = Number(props.config?.duracao_reserva_minutos ?? 0);
  if (!minutes) {
    return '---';
  }
  return `${minutes} min`;
});
</script>

<style scoped>
.config-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.config-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.config-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.config-status {
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--dash-muted, #64748b);
}

.config-status.is-loading {
  color: var(--dash-warning, #f59e0b);
  background: var(--dash-warning-soft, rgba(245, 158, 11, 0.15));
  border-color: transparent;
}

.config-empty {
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
  text-align: center;
  padding: 18px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.config-item {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-item--wide {
  grid-column: span 2;
}

.config-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.config-value {
  font-size: 0.95rem;
  color: var(--dash-text, #0f172a);
}

.day-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.day-pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface, #ffffff);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--dash-muted, #64748b);
}

.day-pill.is-active {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  border-color: transparent;
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item--wide {
    grid-column: span 1;
  }
}
</style>
