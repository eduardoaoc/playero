<template>
  <footer class="border-t border-white/10 bg-[#0F0F12]">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-center md:flex-row md:text-left">
      <div class="flex items-center gap-3">
        <span class="text-lg font-semibold text-white">{{ logoText }}</span>
        <span v-if="tagline" class="text-xs uppercase tracking-[0.2em] text-[#B5B5B5]">
          {{ tagline }}
        </span>
      </div>
      <p v-if="legalText" class="text-xs text-[#B5B5B5]">{{ legalText }}</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  logoText: {
    type: String,
    default: 'Playero',
  },
  tagline: {
    type: String,
    default: '',
  },
  legalText: {
    type: String,
    default: '',
  },
});
</script>
