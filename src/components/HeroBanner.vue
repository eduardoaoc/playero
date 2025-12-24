<template>
  <section class="relative flex min-h-screen items-center overflow-hidden">
    <div class="absolute inset-0">
      <div
        class="h-full w-full bg-cover bg-center"
        :style="backgroundStyle"
      ></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-black/40 to-transparent"></div>
    </div>

    <div class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-28">
      <div class="max-w-2xl">
        <h1 v-if="title" class="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-5 text-base leading-relaxed text-[#B5B5B5] sm:text-lg">
          {{ subtitle }}
        </p>
        <a
          v-if="ctaLabel"
          :href="ctaHref"
          class="mt-8 inline-flex items-center justify-center rounded-full bg-[#FF7A00] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#FF8F26]"
        >
          {{ ctaLabel }}
        </a>
      </div>
    </div>
  </section>
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
  backgroundUrl: {
    type: String,
    default: '',
  },
});

const backgroundStyle = computed(() => {
  if (!props.backgroundUrl) {
    return {
      backgroundImage: 'radial-gradient(circle at top, rgba(255, 122, 0, 0.25), rgba(15, 15, 18, 0.9))',
    };
  }

  return {
    backgroundImage: `url(${props.backgroundUrl})`,
  };
});
</script>
