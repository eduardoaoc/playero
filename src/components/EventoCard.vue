<template>
  <article class="evento-card">
    <div class="evento-head">
      <h3 class="evento-title">{{ title }}</h3>
      <span class="evento-count">{{ attendees }} inscritos</span>
    </div>
    <p class="evento-meta">{{ meta }}</p>
    <p class="evento-location">{{ location }}</p>
    <div class="evento-actions">
      <a v-if="secondaryActionLabel" class="evento-button evento-button--ghost" :href="secondaryActionHref">
        {{ secondaryActionLabel }}
      </a>
      <a v-if="primaryActionLabel" class="evento-button evento-button--primary" :href="primaryActionHref">
        {{ primaryActionLabel }}
      </a>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  meta: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  attendees: {
    type: [String, Number],
    default: 0,
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
});
</script>

<style scoped>
.evento-card {
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius, 18px);
  padding: 18px;
  box-shadow: var(--dash-shadow, 0 18px 40px -30px rgba(15, 23, 42, 0.35));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evento-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.evento-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.evento-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--dash-surface-soft, #f6f8fb);
}

.evento-meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.evento-location {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #64748b);
}

.evento-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.evento-button {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
}

.evento-button--ghost {
  border-color: var(--dash-border, #e6e9ef);
  color: var(--dash-text, #0f172a);
  background: var(--dash-surface-soft, #f6f8fb);
}

.evento-button--primary {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
}
</style>


