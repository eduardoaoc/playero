<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-white">2. Escolha a data</h2>
      <p class="text-sm text-[#B5B5B5]">Calend&#225;rio mensal aberto com todos os dias dispon&#237;veis e indispon&#237;veis.</p>
    </div>

    <div class="rounded-2xl border border-white/10 bg-[#1A1A1F] p-4">
      <label class="text-xs uppercase tracking-[0.2em] text-white/50">Data da reserva</label>
      <input
        type="date"
        class="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition focus:border-[#FF7A00] focus:outline-none focus:ring-1 focus:ring-[#FF7A00]/60 disabled:cursor-not-allowed disabled:opacity-60"
        :min="minDate"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
      />
      <p v-if="disabled" class="mt-2 text-xs text-white/60">Selecione uma quadra para liberar o calend&#225;rio.</p>
    </div>

    <div class="rounded-2xl border border-white/10 bg-[#1A1A1F] p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-white">Calend&#225;rio aberto</h3>
          <p class="text-xs text-white/60">{{ monthLabel }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#FF7A00]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="disabled || !canPrev"
            aria-label="M&#234;s anterior"
            @click="emit('prev-month')"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#FF7A00]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="disabled || !canNext"
            aria-label="Pr&#243;ximo m&#234;s"
            @click="emit('next-month')"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.2em] text-white/50">
        <span v-for="label in weekLabels" :key="label">{{ label }}</span>
      </div>

      <div v-if="calendarCells.length === 0" class="mt-4 text-sm text-white/60">
        Selecione uma quadra para visualizar as datas.
      </div>

      <div v-else class="mt-4 grid grid-cols-7 gap-2">
        <div
          v-for="cell in calendarCells"
          :key="cell.key"
          class="rounded-xl border border-white/10 bg-[#121216] p-2 transition"
          :class="cellContainerClass(cell)"
        >
          <button
            v-if="cell.date"
            type="button"
            class="flex h-full w-full flex-col items-start justify-between gap-2 text-left"
            :class="cellButtonClass(cell)"
            :disabled="disabled || !cell.isSelectable"
            :aria-pressed="modelValue === cell.date"
            @click="onSelectDay(cell)"
          >
            <span :class="cellNumberClass(cell)">{{ cell.dayNumber }}</span>
            <span class="h-2 w-full rounded-full" :class="statusPillClass(cell)"></span>
          </button>
          <div v-else class="h-full"></div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          Dispon&#237;vel
        </div>
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-rose-400"></span>
          Indispon&#237;vel
        </div>
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-white/30"></span>
          Sem dados
        </div>
      </div>

      <div v-if="loadingCalendar" class="mt-3 text-xs text-white/60">
        Atualizando disponibilidade do m&#234;s...
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  minDate: {
    type: String,
    default: '',
  },
  calendarCells: {
    type: Array,
    default: () => [],
  },
  weekLabels: {
    type: Array,
    default: () => [],
  },
  monthLabel: {
    type: String,
    default: '',
  },
  loadingCalendar: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  canPrev: {
    type: Boolean,
    default: false,
  },
  canNext: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'prev-month', 'next-month']);

const onInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const onSelectDay = (day) => {
  if (props.disabled || !day.isSelectable) {
    return;
  }
  emit('update:modelValue', day.date);
};

const cellContainerClass = (cell) => {
  if (!cell.inMonth) {
    return 'border-white/5 bg-[#101014] opacity-60';
  }
  if (cell.isPast) {
    return 'border-white/5 bg-[#101014] opacity-60';
  }
  if (props.modelValue === cell.date) {
    return 'border-[#FF7A00]/80 bg-[#22160e] shadow-[0_18px_40px_-30px_rgba(255,122,0,0.6)]';
  }
  return 'hover:border-[#FF7A00]/50 hover:bg-[#1d1814]';
};

const cellButtonClass = (cell) => {
  if (!cell.inMonth || cell.isPast || props.disabled) {
    return 'cursor-not-allowed';
  }
  return 'focus:outline-none';
};

const cellNumberClass = (cell) => {
  if (!cell.inMonth) {
    return 'text-xs text-white/30';
  }
  if (cell.isPast) {
    return 'text-xs text-white/40';
  }
  if (props.modelValue === cell.date) {
    return 'text-sm font-semibold text-white';
  }
  return 'text-xs text-white/70';
};

const statusPillClass = (cell) => {
  if (!cell.inMonth || cell.isPast) {
    return 'bg-white/10';
  }
  if (cell.status === 'available') {
    return 'bg-emerald-400';
  }
  if (cell.status === 'unavailable') {
    return 'bg-rose-400';
  }
  if (cell.status === 'loading') {
    return 'bg-white/20 animate-pulse';
  }
  return 'bg-white/30';
};
</script>
