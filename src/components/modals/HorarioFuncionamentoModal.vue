<template>
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <header class="modal-header">
        <div>
          <p class="modal-eyebrow">Horario de funcionamento</p>
          <h3 class="modal-title">Definir horario padrao</h3>
        </div>
        <button class="modal-close" type="button" @click="emitClose">
          <DashboardIcon name="x" />
        </button>
      </header>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <label class="form-field" :class="{ 'has-error': showOpenError }">
            <span>Hora de abertura</span>
            <input v-model="form.hora_abertura" type="time" />
            <small v-if="showOpenError" class="form-error">Informe a hora de abertura.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showCloseError }">
            <span>Hora de fechamento</span>
            <input v-model="form.hora_fechamento" type="time" />
            <small v-if="showCloseError" class="form-error">Informe a hora de fechamento.</small>
          </label>
        </div>

        <div class="days-card">
          <span class="days-label">Dias ativos</span>
          <div class="days-grid">
            <label v-for="day in weekDays" :key="day.value" class="day-option">
              <input v-model="form.dias_semana_ativos" type="checkbox" :value="day.value" />
              <span>{{ day.label }}</span>
            </label>
          </div>
          <p v-if="showDaysError" class="form-error">
            Selecione ao menos um dia ativo.
          </p>
        </div>

        <div class="modal-actions">
          <button class="dash-action dash-action--ghost" type="button" @click="emitClose">
            Cancelar
          </button>
          <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar horario</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import DashboardIcon from '../DashboardIcon.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
  weekDays: {
    type: Array,
    default: () => [],
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const form = reactive({
  hora_abertura: '',
  hora_fechamento: '',
  dias_semana_ativos: [],
});

const isSubmitted = ref(false);

const showOpenError = computed(() => isSubmitted.value && !form.hora_abertura);
const showCloseError = computed(() => isSubmitted.value && !form.hora_fechamento);
const showDaysError = computed(
  () => isSubmitted.value && (!form.dias_semana_ativos || !form.dias_semana_ativos.length),
);

const syncForm = () => {
  form.hora_abertura = props.config?.hora_abertura ?? '';
  form.hora_fechamento = props.config?.hora_fechamento ?? '';
  form.dias_semana_ativos = Array.isArray(props.config?.dias_semana_ativos)
    ? [...props.config.dias_semana_ativos]
    : [];
  isSubmitted.value = false;
};

const emitClose = () => {
  if (!props.isSaving) {
    emit('close');
  }
};

const handleOverlayClick = () => {
  emitClose();
};

const handleSubmit = () => {
  isSubmitted.value = true;
  if (showOpenError.value || showCloseError.value || showDaysError.value) {
    return;
  }
  emit('save', {
    hora_abertura: form.hora_abertura,
    hora_fechamento: form.hora_fechamento,
    dias_semana_ativos: [...form.dias_semana_ativos],
  });
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      syncForm();
    }
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 120;
}

.modal-card {
  width: 100%;
  max-width: 640px;
  background: var(--dash-surface, #ffffff);
  border: 1px solid var(--dash-border, #e6e9ef);
  border-radius: var(--dash-radius-lg, 24px);
  box-shadow: var(--dash-shadow, 0 20px 50px -35px rgba(15, 23, 42, 0.35));
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 12px;
  border-bottom: 1px solid var(--dash-border, #e6e9ef);
}

.modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dash-text, #0f172a);
}

.modal-close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-muted, #64748b);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.modal-body {
  padding: 16px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--dash-muted, #64748b);
  font-weight: 600;
}

.form-field input {
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
}

.form-field.has-error input {
  border-color: var(--dash-danger, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
}

.form-error {
  font-size: 0.75rem;
  color: var(--dash-danger, #ef4444);
}

.days-card {
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.days-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-muted, #64748b);
  font-weight: 700;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.day-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--dash-text, #0f172a);
  font-weight: 600;
}

.day-option input {
  width: 16px;
  height: 16px;
  accent-color: var(--dash-primary, #ff7a00);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.dash-action {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface, #ffffff);
  color: var(--dash-text, #0f172a);
  cursor: pointer;
}

.dash-action--primary {
  background: var(--dash-primary, #ff7a00);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 18px 40px -28px var(--dash-primary-soft, rgba(255, 122, 0, 0.45));
}

.dash-action--ghost {
  background: var(--dash-surface-soft, #f6f8fb);
  color: var(--dash-text, #0f172a);
}

.dash-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .days-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
