<template>
  <div class="calendar-wrap">
    <div v-if="showFilter" class="calendar-toolbar">
      <label class="calendar-filter">
        <span>Filtrar por m&#234;s</span>
        <input v-model="monthFilterValue" type="month" :max="monthFilterMax" />
      </label>
    </div>

    <div class="calendar-weekdays">
      <span v-for="day in weekDays" :key="day" class="calendar-weekday">{{ day }}</span>
    </div>

    <div class="calendar-grid">
      <div
        v-for="cell in calendarCells"
        :key="cell.key"
        class="calendar-day"
        :class="{
          'is-empty': !cell.inMonth,
          'is-today': cell.isToday,
          'is-clickable': cell.inMonth,
          'is-disabled': cell.isDisabled,
        }"
        @click="handleSelectDay(cell)"
      >
        <span v-if="cell.inMonth" class="calendar-day-number">{{ cell.day }}</span>
        <div v-if="cell.inMonth" class="calendar-items">
          <button
            v-for="item in cell.previewItems"
            :key="item.id"
            class="calendar-item"
            type="button"
            @click.stop="handleSelectDay(cell)"
          >
            <span class="calendar-item-time">{{ item.horario }}</span>
            <span class="calendar-item-title">{{ item.quadra }}</span>
            <span class="calendar-status" :class="statusTone(item.statusKey)"></span>
          </button>
          <button
            v-if="cell.overflowCount"
            class="calendar-more"
            type="button"
            @click.stop="handleSelectDay(cell)"
          >
            +{{ cell.overflowCount }} reservas
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedDay" class="calendar-overlay" @click="closeDayModal">
      <div class="calendar-modal" @click.stop>
        <header class="calendar-modal-header">
          <div>
            <p class="calendar-modal-eyebrow">Reservas do dia</p>
            <h3 class="calendar-modal-title">{{ selectedDay.label }}</h3>
          </div>
          <button class="calendar-modal-close" type="button" @click="closeDayModal">
            <DashboardIcon name="x" />
          </button>
        </header>
        <div class="calendar-modal-body">
          <div v-if="!selectedDay.items.length" class="calendar-modal-empty">
            Nenhuma reserva registrada neste dia.
          </div>
          <div v-else class="calendar-modal-list">
            <div v-for="item in selectedDay.items" :key="item.id" class="calendar-modal-item">
              <div class="calendar-modal-item-head">
                <span class="calendar-modal-time">{{ item.horario }}</span>
                <ReservaStatusBadge :status="item.statusKey" compact />
              </div>
              <div class="calendar-modal-item-body">
                <span class="calendar-modal-quadra">{{ item.quadra }}</span>
                <span class="calendar-modal-cliente">{{ item.clienteNome || 'Cliente' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import DashboardIcon from './DashboardIcon.vue';
import ReservaStatusBadge from './ReservaStatusBadge.vue';

const props = defineProps({
  reservas: {
    type: Array,
    default: () => [],
  },
  month: {
    type: Number,
    default: undefined,
  },
  year: {
    type: Number,
    default: undefined,
  },
  monthFilter: {
    type: String,
    default: undefined,
  },
  showFilter: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['update:monthFilter']);

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const maxPreviewItems = 3;
const selectedDay = ref(null);

const today = new Date();
const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const maxFutureDate = new Date(todayStart);
maxFutureDate.setFullYear(todayStart.getFullYear() + 1);

const initialYear = Number.isInteger(props.year) ? props.year : todayStart.getFullYear();
const initialMonth = Number.isInteger(props.month) ? props.month : todayStart.getMonth();
const displayYear = ref(initialYear);
const displayMonth = ref(initialMonth);

const formatMonthValue = (year, monthIndex) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const internalMonthFilter = ref(formatMonthValue(displayYear.value, displayMonth.value));
const monthFilterValue = computed({
  get: () => (props.monthFilter !== undefined ? props.monthFilter : internalMonthFilter.value),
  set: (value) => {
    if (props.monthFilter !== undefined) {
      emit('update:monthFilter', value);
      return;
    }
    internalMonthFilter.value = value;
  },
});
const monthFilterMax = computed(() =>
  formatMonthValue(maxFutureDate.getFullYear(), maxFutureDate.getMonth()),
);

const buildDateKey = (year, monthIndex, day) => {
  const monthValue = String(monthIndex + 1).padStart(2, '0');
  const dayValue = String(day).padStart(2, '0');
  return `${year}-${monthValue}-${dayValue}`;
};

const normalizeDateKey = (value) => {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return buildDateKey(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
    const [day, month, year] = raw.split('/');
    return `${year}-${month}-${day}`;
  }
  return '';
};

const reservasByDate = computed(() => {
  const grouped = {};
  props.reservas.forEach((reserva) => {
    const key = normalizeDateKey(reserva?.dataISO || reserva?.data || reserva?.date);
    if (!key) {
      return;
    }
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(reserva);
  });
  Object.keys(grouped).forEach((key) => {
    grouped[key] = grouped[key]
      .slice()
      .sort((a, b) => String(a?.horaInicio || a?.horario || '').localeCompare(String(b?.horaInicio || b?.horario || '')));
  });
  return grouped;
});

const calendarCells = computed(() => {
  const year = displayYear.value;
  const month = displayMonth.value;
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
  const todayKey = buildDateKey(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate());
  const cells = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - firstDayIndex + 1;
    const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const dateKey = inMonth ? buildDateKey(year, month, dayNumber) : null;
    const items = inMonth ? reservasByDate.value[dateKey] || [] : [];
    const isDisabled =
      inMonth &&
      dateKey &&
      new Date(`${dateKey}T00:00:00`) > maxFutureDate;
    cells.push({
      key: dateKey || `empty-${index}`,
      day: inMonth ? dayNumber : '',
      inMonth,
      isToday: dateKey === todayKey,
      isDisabled,
      items,
      previewItems: items.slice(0, maxPreviewItems),
      overflowCount: Math.max(0, items.length - maxPreviewItems),
    });
  }

  return cells;
});

const statusTone = (status) => {
  const raw = String(status || '').toUpperCase();
  if (raw.includes('CONFIRM')) {
    return 'is-success';
  }
  if (raw.includes('CANCEL')) {
    return 'is-danger';
  }
  return 'is-warning';
};

const formatDayLabel = (dateKey) => {
  if (!dateKey) {
    return 'Dia selecionado';
  }
  const [, month, day] = dateKey.split('-');
  return `${day}/${month}`;
};

const handleSelectDay = (cell) => {
  if (!cell?.inMonth || cell?.isDisabled) {
    return;
  }
  selectedDay.value = {
    key: cell.key,
    label: formatDayLabel(cell.key),
    items: cell.items || [],
  };
};

const closeDayModal = () => {
  selectedDay.value = null;
};

watch(
  () => [displayYear.value, displayMonth.value],
  () => {
    monthFilterValue.value = formatMonthValue(displayYear.value, displayMonth.value);
  },
);

watch(
  () => monthFilterValue.value,
  (value) => {
    if (!value) {
      return;
    }
    const [year, month] = value.split('-');
    const nextYear = Number(year);
    const nextMonth = Number(month) - 1;
    if (Number.isNaN(nextYear) || Number.isNaN(nextMonth)) {
      return;
    }
    const nextDate = new Date(nextYear, nextMonth, 1);
    if (nextDate > maxFutureDate) {
      displayYear.value = maxFutureDate.getFullYear();
      displayMonth.value = maxFutureDate.getMonth();
      return;
    }
    displayYear.value = nextYear;
    displayMonth.value = nextMonth;
    selectedDay.value = null;
  },
);
</script>

<style scoped>
.calendar-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}


.calendar-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.calendar-filter input {
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--dash-text, #0f172a);
  font-weight: 600;
}


.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-weekday {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--dash-muted, #64748b);
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0;
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 18px;
  overflow: hidden;
}

.calendar-day {
  min-height: 150px;
  padding: 10px;
  background: var(--dash-surface, #ffffff);
  border-right: 1px solid var(--dash-border, #e6e9ef);
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day.is-empty {
  background: transparent;
  min-height: 80px;
}

.calendar-day.is-today {
  border-color: var(--dash-primary, #ff7a00);
  box-shadow:
    inset 0 0 0 1px var(--dash-primary, #ff7a00),
    0 18px 40px -32px var(--dash-primary-soft, rgba(255, 122, 0, 0.35));
}

.calendar-day.is-clickable {
  cursor: pointer;
}

.calendar-day.is-clickable:not(.is-disabled):hover {
  box-shadow: inset 0 0 0 2px var(--dash-primary, #ff7a00);
}

.calendar-day.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.calendar-day-number {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dash-text, #0f172a);
}

.calendar-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 110px;
  overflow: hidden;
}

.calendar-item {
  border-radius: 10px;
  padding: 6px 8px;
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.calendar-item-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.calendar-item-time {
  font-size: 0.68rem;
  color: var(--dash-muted, #64748b);
}

.calendar-status {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--dash-warning, #f59e0b);
}

.calendar-status.is-success {
  background: var(--dash-success, #16a34a);
}

.calendar-status.is-danger {
  background: var(--dash-danger, #ef4444);
}

.calendar-more {
  border: none;
  background: transparent;
  color: var(--dash-muted, #64748b);
  font-size: 0.68rem;
  font-weight: 600;
  text-align: left;
  padding: 0;
  cursor: pointer;
}

.calendar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 120;
}

.calendar-modal {
  width: 100%;
  max-width: 520px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 20px;
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.calendar-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 12px;
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
}

.calendar-modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.calendar-modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.calendar-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-muted, #64748b);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.calendar-modal-body {
  padding: 16px 20px 20px;
}

.calendar-modal-empty {
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
}

.calendar-modal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-modal-item {
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-modal-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.calendar-modal-time {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.calendar-modal-item-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-modal-quadra {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.calendar-modal-cliente {
  font-size: 0.78rem;
  color: var(--dash-muted, #64748b);
}

@media (max-width: 1024px) {
  .calendar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calendar-weekdays {
    display: none;
  }

  .calendar-day:nth-child(7n) {
    border-right: 1px solid var(--dash-border, #e6e9ef);
  }

  .calendar-day:nth-child(2n) {
    border-right: none;
  }
}

@media (max-width: 640px) {
  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .calendar-day {
    border-right: none;
  }
}
</style>
