<template>
  <a
    class="group block overflow-hidden rounded-2xl bg-[#1A1A1F] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,0.9)]"
    :href="href"
  >
    <div class="relative h-48 overflow-hidden">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="name"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div v-else class="h-full w-full bg-gradient-to-br from-[#1A1A1F] via-[#141418] to-[#0F0F12]"></div>

      <span
        v-if="badgeLabel"
        class="absolute left-4 top-4 rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-semibold text-white shadow-lg"
      >
        {{ badgeLabel }}
      </span>
    </div>

    <div class="p-6">
      <h3 v-if="name" class="text-lg font-semibold text-white">{{ name }}</h3>
      <p v-if="description" class="mt-2 text-sm leading-relaxed text-[#B5B5B5]">
        {{ description }}
      </p>
    </div>
  </a>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  href: {
    type: String,
    default: '#',
  },
  badgeLabel: {
    type: String,
    default: '',
  },
});
</script>
