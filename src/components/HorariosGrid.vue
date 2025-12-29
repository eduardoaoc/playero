<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-white">3. Horarios disponiveis</h2>
      <p class="text-sm text-[#B5B5B5]">Escolha um horario livre para a reserva.</p>
    </div>

    <div
      v-if="disabled"
      class="rounded-2xl border border-white/10 bg-[#1A1A1F] px-4 py-3 text-sm text-white/60"
    >
      Selecione uma quadra e uma data para ver os horarios.
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-2xl border border-[#FF7A00]/40 bg-[#2a1a14] px-4 py-3 text-sm text-white/90"
    >
      {{ errorMessage }}
    </div>

    <div v-else-if="loading" class="grid gap-3 sm:grid-cols-3">
      <div v-for="index in 6" :key="index" class="h-12 rounded-xl bg-white/5 animate-pulse"></div>
    </div>

    <div
      v-else-if="horarios.length === 0"
      class="rounded-2xl border border-white/10 bg-[#1A1A1F] px-4 py-3 text-sm text-white/70"
    >
      Sem horarios disponiveis.
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="horario in horarios"
        :key="horario.id"
        type="button"
        class="rounded-xl border px-4 py-3 text-sm font-semibold transition"
        :class="[
          isSelected(horario.id)
            ? 'border-[#FF7A00] bg-[#22160e] text-white shadow-[0_18px_45px_-30px_rgba(255,122,0,0.5)]'
            : 'border-white/10 bg-[#121216] text-white/80 hover:border-[#FF7A00]/50 hover:bg-[#1d1814]',
        ]"
        :aria-pressed="isSelected(horario.id)"
        @click="emit('select', horario.id)"
      >
        {{ formatHorario(horario) }}
      </button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  horarios: {
    type: Array,
    default: () => [],
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select']);

const isSelected = (id) => String(props.selectedId) === String(id);

const formatHorario = (horario) => {
  if (!horario) {
    return '';
  }
  const inicio = horario.horaInicio || '';
  const fim = horario.horaFim || '';
  return fim ? `${inicio} - ${fim}` : inicio;
};
</script>
