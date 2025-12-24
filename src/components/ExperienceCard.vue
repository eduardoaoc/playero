<template>
  <article
    class="group overflow-hidden rounded-2xl bg-[#1A1A1F] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,0.9)]"
  >
    <div class="relative h-44 overflow-hidden">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="title"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div v-else class="h-full w-full bg-gradient-to-br from-[#1A1A1F] via-[#15151B] to-[#0F0F12]"></div>
    </div>

    <div class="p-6">
      <h3 v-if="title" class="text-lg font-semibold text-white">{{ title }}</h3>
      <p v-if="text" class="mt-2 text-sm leading-relaxed text-[#B5B5B5]">
        {{ text }}
      </p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
});
</script>
