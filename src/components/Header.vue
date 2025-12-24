<template>
  <header class="fixed inset-x-0 top-0 z-50">
    <div class="bg-white/5 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a class="flex items-center gap-3" :href="homeHref">
          <img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="logoAlt"
            class="h-9 w-auto max-w-[180px] object-contain sm:h-10 md:h-11"
          />
        </a>

        <div class="flex items-center gap-3">
          <nav v-if="hasLinks" class="hidden items-center gap-6 text-sm text-[#B5B5B5] md:flex">
            <a
              v-for="link in links"
              :key="link.href"
              :href="link.href"
              class="transition-colors hover:text-white"
            >
              {{ link.label }}
            </a>
          </nav>

          <div v-if="hasActions" class="flex items-center gap-2">
            <component
              v-for="action in actions"
              :is="action?.type === 'toggle' ? 'button' : 'a'"
              :key="action.label"
              :href="action?.type === 'toggle' ? undefined : action.href"
              :type="action?.type === 'toggle' ? 'button' : undefined"
              :class="actionClasses(action?.variant)"
              @click="onActionClick(action)"
            >
              {{ action.label }}
            </component>
          </div>

          <a
            v-if="showUser"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20"
            :href="userHref"
            aria-label="User login"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
          </a>

          <button
            v-if="showMenuToggle"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20 md:hidden"
            type="button"
            aria-label="Toggle menu"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-menu"
            @click="toggleMenu"
          >
            <svg
              v-if="!isMenuOpen"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg
              v-else
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isMenuOpen"
      id="mobile-menu"
      class="border-t border-white/10 bg-[#0F0F12]/95 backdrop-blur-md md:hidden"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 text-sm text-white/80">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="transition-colors hover:text-white"
          @click="closeMenu"
        >
          {{ link.label }}
        </a>
        <component
          v-for="action in actions"
          :is="action?.type === 'toggle' ? 'button' : 'a'"
          :key="`mobile-${action.label}`"
          :href="action?.type === 'toggle' ? undefined : action.href"
          :type="action?.type === 'toggle' ? 'button' : undefined"
          :class="actionClasses(action?.variant, true)"
          @click="onMobileActionClick(action)"
        >
          {{ action.label }}
        </component>
        <a
          v-if="ctaLabel"
          :href="ctaHref"
          class="inline-flex w-full items-center justify-center rounded-full bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF8F26]"
          @click="closeMenu"
        >
          {{ ctaLabel }}
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  logoSrc: {
    type: String,
    default: '',
  },
  logoAlt: {
    type: String,
    default: 'Playero',
  },
  logoText: {
    type: String,
    default: 'Playero',
  },
  homeHref: {
    type: String,
    default: '/',
  },
  userHref: {
    type: String,
    default: '/login',
  },
  links: {
    type: Array,
    default: () => [],
  },
  ctaLabel: {
    type: String,
    default: '',
  },
  ctaHref: {
    type: String,
    default: '#',
  },
  actions: {
    type: Array,
    default: () => [],
  },
  showUser: {
    type: Boolean,
    default: true,
  },
  showMenuToggle: {
    type: Boolean,
    default: true,
  },
});

// Mobile menu state lives in the header to keep the component self-contained.
const isMenuOpen = ref(false);

const hasLinks = computed(() => props.links.length > 0);
const hasActions = computed(() => props.actions.length > 0);

const actionClasses = (variant = 'ghost', isMobile = false) => {
  const base =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition';
  const width = isMobile ? ' w-full' : '';

  if (variant === 'solid') {
    return `${base}${width} bg-[#FF7A00] text-white hover:bg-[#FF8F26]`;
  }

  if (variant === 'outline') {
    return `${base}${width} border border-white/20 text-white hover:border-white/40`;
  }

  return `${base}${width} bg-white/10 text-white hover:bg-white/20`;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const onActionClick = (action) => {
  if (action?.type === 'toggle') {
    toggleMenu();
  }
};

const onMobileActionClick = (action) => {
  if (action?.type === 'toggle') {
    toggleMenu();
    return;
  }
  closeMenu();
};
</script>
