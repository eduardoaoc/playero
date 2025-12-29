<template>
  <article v-if="isAdmin" class="dashboard-quadra-card">
    <div class="dashboard-quadra-head">
      <div>
        <h3 class="dashboard-quadra-title">{{ name }}</h3>
        <p v-if="adminSubtitle" class="dashboard-quadra-subtitle">{{ adminSubtitle }}</p>
      </div>
      <StatusBadge v-if="status" :status="status" />
    </div>

    <div class="dashboard-quadra-next">
      <span class="dashboard-quadra-label">{{ nextReservationLabel }}</span>
      <span class="dashboard-quadra-time">{{ nextReservationTime }}</span>
    </div>

    <div class="dashboard-quadra-actions">
      <a
        v-if="secondaryActionLabel"
        class="dashboard-quadra-action dashboard-quadra-action--ghost"
        :href="secondaryActionHref"
      >
        {{ secondaryActionLabel }}
        <DashboardIcon name="arrow-up-right" :size="16" />
      </a>
      <a
        v-if="primaryActionLabel"
        class="dashboard-quadra-action dashboard-quadra-action--primary"
        :href="primaryActionHref"
      >
        {{ primaryActionLabel }}
      </a>
    </div>
  </article>

  <a
    v-else
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
import { computed } from 'vue';
import DashboardIcon from './DashboardIcon.vue';
import StatusBadge from './StatusBadge.vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'marketing',
  },
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  nextReservationLabel: {
    type: String,
    default: 'Próxima',
  },
  nextReservationTime: {
    type: String,
    default: '',
  },
  primaryActionLabel: {
    type: String,
    default: '',
  },
  primaryActionHref: {
    type: String,
    default: '#',
  },
  secondaryActionLabel: {
    type: String,
    default: '',
  },
  secondaryActionHref: {
    type: String,
    default: '#',
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

const isAdmin = computed(() => props.variant === 'admin');
const adminSubtitle = computed(() => props.subtitle || props.description);
</script>

<style scoped>
.dashboard-quadra-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius, 18px);
  padding: 18px;
  box-shadow: var(--dash-shadow, 0 18px 40px -30px rgba(15, 23, 42, 0.35));
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.dashboard-quadra-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-quadra-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.dashboard-quadra-subtitle {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--dash-muted, #64748b);
}

.dashboard-quadra-next {
  background: var(--dash-surface-soft, #f6f8fb);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dashboard-quadra-label {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.dashboard-quadra-time {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.dashboard-quadra-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dashboard-quadra-action {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
}

.dashboard-quadra-action--ghost {
  border-color: var(--dash-border, #e6e9ef);
  color: var(--dash-text, #0f172a);
  background: var(--dash-surface-soft, #f6f8fb);
}

.dashboard-quadra-action--primary {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
}
</style>


