<template>
  <section class="rounded-2xl border border-white/10 bg-[#1A1A1F] p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)]">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">Resumo da reserva</h2>
      <span
        class="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
        :class="statusBadgeClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="mt-5 space-y-4 text-sm">
      <div class="flex items-center justify-between gap-3">
        <span class="text-white/60">Quadra</span>
        <span class="text-white">{{ displayQuadra }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="text-white/60">Data</span>
        <span class="text-white">{{ displayData }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="text-white/60">Hor&#225;rio</span>
        <span class="text-white">{{ displayHorario }}</span>
      </div>
    </div>

    <div v-if="hasReserva" class="mt-6 rounded-xl border border-[#FF7A00]/40 bg-[#2a1a14] px-4 py-3 text-sm text-white/90">
      Status: <span class="font-semibold text-white">{{ displayStatus }}</span>
    </div>

    <button
      v-if="canCheckout"
      type="button"
      class="mt-5 w-full rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF8F26]"
      @click="goToCheckout"
    >
      Ir para pagamento
    </button>

    <p v-else class="mt-5 text-xs text-white/50">
      Confirme a reserva para liberar o checkout de pagamento.
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  reserva: {
    type: Object,
    default: null,
  },
  resumo: {
    type: Object,
    default: () => ({}),
  },
});

const router = useRouter();

const hasReserva = computed(() => Boolean(props.reserva));
const canCheckout = computed(() => Boolean(props.reserva?.id));

const displayQuadra = computed(() => props.reserva?.quadra || props.resumo?.quadra || '-');
const displayData = computed(() => props.reserva?.data || props.resumo?.data || '-');
const displayHorario = computed(() => props.reserva?.horario || props.resumo?.horario || '-');
const displayStatus = computed(() => props.reserva?.status || 'pendente_pagamento');

const statusLabel = computed(() => (hasReserva.value ? 'PENDENTE' : 'RASCUNHO'));

const statusBadgeClass = computed(() =>
  hasReserva.value
    ? 'border-[#FF7A00]/50 bg-[#2a1a14] text-[#FF7A00]'
    : 'border-white/10 bg-black/30 text-white/50'
);

const goToCheckout = () => {
  if (!canCheckout.value) {
    return;
  }
  router.push(`/checkout/${props.reserva.id}`);
};
</script>
