<template>
  <div class="calendar-shell animate-fade-up">
    <header class="calendar-header">
      <div class="calendar-heading">
        <p class="calendar-eyebrow">Calendario geral</p>
        <h2 class="calendar-title">{{ monthLabel }}</h2>
        <p class="calendar-subtitle">Centralize reservas, eventos e bloqueios.</p>
      </div>
      <div class="calendar-nav">
        <button class="calendar-nav-button" type="button" @click="handlePrevMonth">
          Mes anterior
        </button>
        <button class="calendar-nav-button" type="button" @click="handleNextMonth">
          Proximo mes
        </button>
      </div>
    </header>

    <div class="calendar-weekdays">
      <span v-for="day in weekDays" :key="day" class="calendar-weekday">{{ day }}</span>
    </div>

    <div class="calendar-grid-wrap">
      <div class="calendar-grid">
        <button
          v-for="(cell, index) in cells"
          :key="cell.key"
          class="calendar-cell animate-fade-up"
          :class="{
            'is-empty': !cell.inMonth,
            'is-today': cell.isToday,
            'has-reservations': cell.reservationCount,
            'has-events': cell.eventCount,
            'is-busy': cell.isBusy,
            'is-closed': cell.isClosed,
            'is-special': cell.isSpecial,
          }"
          :disabled="!cell.inMonth"
          :tabindex="cell.inMonth ? 0 : -1"
          type="button"
          :style="{ animationDelay: `${Math.min(index, 28) * 18}ms` }"
          @click="handleSelect(cell)"
        >
          <span v-if="cell.inMonth" class="calendar-day-number">{{ cell.day }}</span>

          <div v-if="cell.inMonth && cell.isClosed" class="calendar-closed">
            <DashboardIcon name="ban" :size="14" />
            <span>Fechado</span>
          </div>

          <div v-if="cell.inMonth && cell.reservations?.length" class="calendar-items">
            <span
              v-for="pill in reservationStatusPills(cell.reservations)"
              :key="`${cell.key}-${pill.key}`"
              class="calendar-pill calendar-pill--status"
              :class="pill.tone !== 'default' ? `calendar-pill--status-${pill.tone}` : ''"
            >
              {{ pill.count }} {{ pill.label }}
            </span>
          </div>

          <div v-if="cell.inMonth && !cell.isClosed" class="calendar-meta">
            <span v-if="cell.reservationCount" class="calendar-pill calendar-pill--reservas">
              {{ cell.reservationCount }} Reservas
            </span>
            <span v-if="cell.eventCount" class="calendar-pill calendar-pill--eventos">
              {{ cell.eventCount }} Eventos
            </span>
            <span v-if="cell.isSpecial" class="calendar-pill calendar-pill--special">
              Especial
            </span>
            <span v-if="cell.isHoliday" class="calendar-pill calendar-pill--holiday">
              Feriado
            </span>
          </div>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="calendar-loading">Carregando calendario...</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DashboardIcon from './DashboardIcon.vue';

const props = defineProps({
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  cells: {
    type: Array,
    default: () => [],
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

const emit = defineEmits(['select-day', 'prev-month', 'next-month']);

const monthLabel = computed(() => {
  const date = new Date(props.year, props.month, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
});

const normalizeStatusKey = (status) =>
  String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');

const statusLabelMap = {
  confirmada: 'Confirmada',
  pre_reserva: 'Pré-Reserva',
  prereserva: 'Pré-Reserva',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
};

const statusToneMap = {
  pre_reserva: 'warning',
  prereserva: 'warning',
};

const resolveStatusLabel = (status) => {
  const key = normalizeStatusKey(status);
  return statusLabelMap[key] || String(status || '').trim();
};

const resolveStatusTone = (status) => {
  const key = normalizeStatusKey(status);
  return statusToneMap[key] || 'default';
};

const reservationStatusPills = (reservations = []) => {
  const grouped = new Map();
  reservations.forEach((reservation) => {
    const status = reservation?.status;
    const key = normalizeStatusKey(status);
    const label = resolveStatusLabel(status);
    if (!label) {
      return;
    }
    const current = grouped.get(key) || { key, label, count: 0, tone: resolveStatusTone(status) };
    current.count += 1;
    grouped.set(key, current);
  });
  return Array.from(grouped.values());
};

const handleSelect = (cell) => {
  if (!cell?.inMonth) {
    return;
  }
  emit('select-day', cell);
};

const handlePrevMonth = () => {
  emit('prev-month');
};

const handleNextMonth = () => {
  emit('next-month');
};
</script>

<style scoped>
.calendar-shell {
  background: linear-gradient(135deg, rgba(26, 26, 31, 0.88), rgba(14, 14, 18, 0.7));
  border: 1px solid var(--dash-border, #262631);
  border-radius: var(--dash-radius-lg, 24px);
  padding: 18px 20px 20px;
  box-shadow: var(--dash-shadow, 0 20px 60px -40px rgba(0, 0, 0, 0.8));
  backdrop-filter: blur(18px);
  --calendar-reservas: #3b82f6;
  --calendar-reservas-soft: rgba(59, 130, 246, 0.18);
  --calendar-eventos: #8b5cf6;
  --calendar-eventos-soft: rgba(139, 92, 246, 0.18);
  --calendar-bloqueios: #ef4444;
  --calendar-bloqueios-soft: rgba(239, 68, 68, 0.2);
  --calendar-special: #f59e0b;
  --calendar-special-soft: rgba(245, 158, 11, 0.2);
}

.calendar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.calendar-heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.calendar-eyebrow {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--dash-muted, #b5b5b5);
  font-weight: 700;
}

.calendar-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--dash-text, #ffffff);
}

.calendar-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #b5b5b5);
}

.calendar-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.calendar-nav-button {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--dash-border, #262631);
  background: rgba(26, 26, 31, 0.8);
  color: var(--dash-text, #ffffff);
  cursor: pointer;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.calendar-weekday {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--dash-muted, #b5b5b5);
  text-align: center;
}

.calendar-grid-wrap {
  overflow-x: auto;
  padding-bottom: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(140px, 1fr));
  grid-auto-rows: minmax(160px, auto);
  min-width: 980px;
  border: 1px solid var(--dash-border, #262631);
  border-radius: 18px;
  overflow: hidden;
}

.calendar-cell {
  border: none;
  min-height: 160px;
  padding: 14px 12px 16px;
  background: rgba(18, 18, 22, 0.9);
  border-right: 1px solid var(--dash-border, #262631);
  border-bottom: 1px solid var(--dash-border, #262631);
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  color: var(--dash-text, #ffffff);
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.calendar-cell:focus-visible {
  outline: 2px solid rgba(255, 122, 0, 0.6);
  outline-offset: -2px;
}

.calendar-cell:nth-child(7n) {
  border-right: none;
}

.calendar-cell:disabled {
  cursor: default;
}

.calendar-cell:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 18px 30px -26px rgba(0, 0, 0, 0.6);
  transform: translateY(-1px);
}

.calendar-cell.is-empty {
  background: transparent;
  border-right: 1px solid var(--dash-border, #262631);
  border-bottom: 1px solid var(--dash-border, #262631);
}

.calendar-cell.is-today {
  box-shadow: inset 0 0 0 1px var(--dash-primary, #ff7a00);
}

.calendar-cell.has-reservations {
  background: var(--calendar-reservas-soft, rgba(59, 130, 246, 0.12));
}

.calendar-cell.has-events {
  background: var(--calendar-eventos-soft, rgba(139, 92, 246, 0.12));
}

.calendar-cell.is-busy {
  box-shadow:
    inset 0 0 0 1px rgba(255, 122, 0, 0.45),
    0 16px 30px -24px rgba(255, 122, 0, 0.6);
}

.calendar-cell.is-closed {
  background: var(--calendar-bloqueios-soft, rgba(239, 68, 68, 0.2));
  color: var(--calendar-bloqueios, #ef4444);
}

.calendar-cell.is-special {
  border-top: 2px solid rgba(245, 158, 11, 0.65);
}

.calendar-day-number {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--dash-text, #ffffff);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.calendar-closed {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.2);
  color: var(--dash-danger, #ef4444);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.calendar-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.calendar-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.calendar-pill {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--dash-text, #ffffff);
  background: rgba(26, 26, 31, 0.7);
  border: 1px solid var(--dash-border, #262631);
  line-height: 1.25;
  white-space: normal;
}

.calendar-pill--reservas {
  color: var(--calendar-reservas, #3b82f6);
  border-color: rgba(59, 130, 246, 0.45);
  background: rgba(59, 130, 246, 0.12);
}

.calendar-pill--status {
  color: var(--calendar-reservas, #3b82f6);
  border-color: rgba(59, 130, 246, 0.45);
  background: rgba(59, 130, 246, 0.12);
}

.calendar-pill--status-warning {
  color: var(--dash-warning, #f59e0b);
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.12);
}

.calendar-pill--eventos {
  color: var(--calendar-eventos, #8b5cf6);
  border-color: rgba(139, 92, 246, 0.45);
  background: rgba(139, 92, 246, 0.12);
}

.calendar-pill--special,
.calendar-pill--holiday {
  color: var(--calendar-special, #f59e0b);
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.12);
}

.calendar-pill--holiday {
  color: var(--calendar-bloqueios, #ef4444);
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.12);
}

.calendar-loading {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--dash-muted, #b5b5b5);
}

@media (max-width: 1024px) {
  .calendar-grid {
    min-width: 900px;
  }
}

@media (max-width: 640px) {
  .calendar-shell {
    padding: 16px;
  }

  .calendar-weekdays {
    display: none;
  }

  .calendar-grid {
    min-width: 760px;
  }
}
</style>
