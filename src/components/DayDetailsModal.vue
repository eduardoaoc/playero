<template>
  <div v-if="open" class="day-modal-overlay" @click="emitClose">
    <div class="day-modal animate-fade-up" @click.stop>
      <header class="day-modal-header">
        <div>
          <p class="day-modal-eyebrow">Detalhes do dia</p>
          <h3 class="day-modal-title">{{ dayLabel }}</h3>
        </div>
        <button class="day-modal-close" type="button" @click="emitClose">
          <DashboardIcon name="x" />
        </button>
      </header>

      <div class="day-modal-body">
        <section class="day-section">
          <div class="day-section-head">
            <h4>Status do dia</h4>
            <span class="day-status-badge" :class="statusClass">{{ statusLabel }}</span>
          </div>
          <p v-if="statusDetail" class="day-status-detail">{{ statusDetail }}</p>
          <div v-if="specialHours.length" class="day-pill-group">
            <span v-for="(hour, index) in specialHours" :key="`${hour}-${index}`" class="day-pill">
              {{ hour }}
            </span>
          </div>
        </section>

        <section class="day-section">
          <h4>Reservas do dia</h4>
          <p v-if="!reservations.length" class="day-empty">Nenhuma reserva encontrada.</p>
          <ul v-else class="day-list">
            <li v-for="item in reservations" :key="item.id" class="day-item">
              <div>
                <p class="day-item-title">{{ item.court || 'Quadra' }}</p>
                <p class="day-item-subtitle">{{ item.time || '--:--' }}</p>
              </div>
              <span v-if="item.status" class="day-item-status">{{ item.status }}</span>
            </li>
          </ul>
        </section>

        <section class="day-section">
          <h4>Eventos do dia</h4>
          <p v-if="!events.length" class="day-empty">Nenhum evento neste periodo.</p>
          <ul v-else class="day-list">
            <li v-for="event in events" :key="event.id" class="day-item">
              <div>
                <p class="day-item-title">{{ event.title }}</p>
                <p class="day-item-subtitle">{{ event.time || event.location || 'Sem detalhes' }}</p>
              </div>
              <span v-if="event.status" class="day-item-status">{{ event.status }}</span>
            </li>
          </ul>
        </section>

        <section class="day-section">
          <h4>Horarios ocupados</h4>
          <p v-if="!occupiedSlots.length" class="day-empty">Nenhum horario ocupado.</p>
          <div v-else class="day-pill-group">
            <span v-for="slot in occupiedSlots" :key="slot" class="day-pill">
              {{ slot }}
            </span>
          </div>
        </section>

        <section class="day-section">
          <h4>Observacoes administrativas</h4>
          <p v-if="!notes.length" class="day-empty">Sem observacoes.</p>
          <ul v-else class="day-notes">
            <li v-for="(note, index) in notes" :key="`${note}-${index}`">
              {{ note }}
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DashboardIcon from './DashboardIcon.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  day: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const dayLabel = computed(() => props.day?.label || 'Dia selecionado');
const statusLabel = computed(() => props.day?.statusLabel || 'Aberto');
const statusDetail = computed(() => props.day?.statusDetail || '');
const statusClass = computed(() => `tone-${props.day?.statusTone || 'default'}`);
const reservations = computed(() => props.day?.reservations || []);
const events = computed(() => props.day?.events || []);
const occupiedSlots = computed(() => props.day?.occupiedSlots || []);
const specialHours = computed(() => props.day?.specialHours || []);
const notes = computed(() => props.day?.notes || []);

const emitClose = () => emit('close');
</script>

<style scoped>
.day-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 12, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 140;
}

.day-modal {
  width: 100%;
  max-width: 720px;
  border-radius: 22px;
  border: 1px solid var(--dash-border, #262631);
  background: linear-gradient(160deg, rgba(28, 28, 34, 0.96), rgba(16, 16, 20, 0.92));
  box-shadow: var(--dash-shadow, 0 20px 60px -40px rgba(0, 0, 0, 0.8));
}

.day-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 12px;
  border-bottom: 1px solid var(--dash-border, #262631);
}

.day-modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--dash-muted, #b5b5b5);
  font-weight: 700;
}

.day-modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dash-text, #ffffff);
}

.day-modal-close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--dash-border, #262631);
  background: rgba(26, 26, 31, 0.9);
  color: var(--dash-muted, #b5b5b5);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.day-modal-body {
  padding: 16px 22px 22px;
  display: grid;
  gap: 16px;
}

.day-section {
  border-radius: 16px;
  border: 1px solid var(--dash-border, #262631);
  background: rgba(18, 18, 22, 0.8);
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.day-section h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--dash-text, #ffffff);
}

.day-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.day-status-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(26, 26, 31, 0.9);
  color: var(--dash-muted, #b5b5b5);
  border: 1px solid var(--dash-border, #262631);
}

.day-status-badge.tone-success {
  background: rgba(22, 163, 74, 0.2);
  color: var(--dash-success, #16a34a);
  border-color: transparent;
}

.day-status-badge.tone-warning {
  background: rgba(245, 158, 11, 0.2);
  color: var(--dash-warning, #f59e0b);
  border-color: transparent;
}

.day-status-badge.tone-danger {
  background: rgba(239, 68, 68, 0.2);
  color: var(--dash-danger, #ef4444);
  border-color: transparent;
}

.day-status-detail {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #b5b5b5);
}

.day-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.day-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(26, 26, 31, 0.7);
  border: 1px solid var(--dash-border, #262631);
}

.day-item-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dash-text, #ffffff);
}

.day-item-subtitle {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--dash-muted, #b5b5b5);
}

.day-item-status {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--dash-muted, #b5b5b5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.day-empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--dash-muted, #b5b5b5);
}

.day-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.day-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(26, 26, 31, 0.8);
  border: 1px solid var(--dash-border, #262631);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--dash-text, #ffffff);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.day-notes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--dash-muted, #b5b5b5);
}

@media (max-width: 640px) {
  .day-modal {
    max-height: 90vh;
    overflow-y: auto;
  }

  .day-section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
