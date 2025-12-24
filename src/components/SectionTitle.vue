<template>
  <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 v-if="title" class="text-3xl font-semibold text-white sm:text-4xl">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-3 max-w-2xl text-sm leading-relaxed text-[#B5B5B5] sm:text-base">
        {{ subtitle }}
      </p>
    </div>
    <a v-if="ctaLabel" :href="ctaHref" :class="ctaClasses">
      {{ ctaLabel }}
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  ctaLabel: {
    type: String,
    default: '',
  },
  ctaHref: {
    type: String,
    default: '#',
  },
  ctaVariant: {
    type: String,
    default: 'outline',
  },
});

const ctaClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition';

  if (props.ctaVariant === 'solid') {
    return `${base} bg-[#FF7A00] text-white hover:bg-[#FF8F26]`;
  }

  return `${base} border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white`;
});
</script>
