<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold text-white">1. Escolha a quadra</h2>
        <p class="text-sm text-[#B5B5B5]">Selecione uma quadra ativa para continuar.</p>
      </div>
      <span v-if="loading" class="text-xs text-white/60">Carregando quadras...</span>
    </div>

    <div
      v-if="errorMessage"
      class="rounded-2xl border border-[#FF7A00]/40 bg-[#2a1a14] px-4 py-3 text-sm text-white/90"
    >
      {{ errorMessage }}
    </div>

    <div v-else-if="loading" class="grid gap-4 sm:grid-cols-2">
      <div v-for="index in 4" :key="index" class="h-24 rounded-2xl bg-white/5 animate-pulse"></div>
    </div>

    <div
      v-else-if="quadras.length === 0"
      class="rounded-2xl border border-white/10 bg-[#1A1A1F] px-4 py-3 text-sm text-white/70"
    >
      Nenhuma quadra disponivel no momento.
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <button
        v-for="quadra in quadras"
        :key="quadra.id"
        type="button"
        class="group rounded-2xl border px-4 py-4 text-left transition"
        :class="[
          isSelected(quadra.id)
            ? 'border-[#FF7A00] bg-[#22160e] shadow-[0_20px_60px_-40px_rgba(255,122,0,0.6)]'
            : 'border-white/10 bg-[#1A1A1F] hover:border-[#FF7A00]/60 hover:bg-[#1f1b17]',
        ]"
        :aria-pressed="isSelected(quadra.id)"
        @click="emit('select', quadra.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/50">{{ quadra.type }}</p>
            <h3 class="mt-2 text-lg font-semibold text-white">{{ quadra.name }}</h3>
          </div>
          <span
            v-if="isSelected(quadra.id)"
            class="rounded-full border border-[#FF7A00]/40 bg-[#2c1d13] px-3 py-1 text-[11px] font-semibold text-[#FF7A00]"
          >
            Selecionada
          </span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  quadras: {
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
  errorMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select']);

const isSelected = (id) => String(props.selectedId) === String(id);
</script>
