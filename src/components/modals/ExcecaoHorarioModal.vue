<template>
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <header class="modal-header">
        <div>
          <p class="modal-eyebrow">{{ eyebrowLabel }}</p>
          <h3 class="modal-title">{{ titleLabel }}</h3>
        </div>
        <button class="modal-close" type="button" @click="emitClose">
          <DashboardIcon name="x" />
        </button>
      </header>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <label class="form-field" :class="{ 'has-error': showDateError }">
            <span>Data</span>
            <input v-model="form.data" type="date" />
            <small v-if="showDateError" class="form-error">Informe a data.</small>
          </label>
          <label class="form-field">
            <span>Hora de abertura</span>
            <input v-model="form.hora_abertura" type="time" :disabled="form.fechado" />
          </label>
          <label class="form-field">
            <span>Hora de fechamento</span>
            <input v-model="form.hora_fechamento" type="time" :disabled="form.fechado" />
          </label>
          <label class="form-field form-field--toggle">
            <span>Fechado o dia todo</span>
            <div class="toggle">
              <input id="excecao-fechada" v-model="form.fechado" type="checkbox" />
              <span class="toggle-slider" aria-hidden="true"></span>
            </div>
          </label>
          <label class="form-field form-field--wide">
            <span>Motivo</span>
            <input v-model="form.motivo" type="text" placeholder="Evento interno" />
          </label>
        </div>

        <p v-if="showTimeError" class="form-error">
          Informe hor&#225;rio de abertura e fechamento ou marque como fechado.
        </p>

        <div class="modal-actions">
          <button class="dash-action dash-action--ghost" type="button" @click="emitClose">
            Cancelar
          </button>
          <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving">Salvando...</span>
            <span v-else>{{ submitLabel }}</span>
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
  mode: {
    type: String,
    default: 'create',
  },
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const form = reactive({
  data: '',
  hora_abertura: '',
  hora_fechamento: '',
  fechado: false,
  motivo: '',
});

const isSubmitted = ref(false);
const isEditMode = computed(() => props.mode === 'edit');
const eyebrowLabel = computed(() =>
  isEditMode.value ? 'Exce\u00e7\u00e3o de hor\u00e1rio' : 'Exce\u00e7\u00e3o de hor\u00e1rio',
);
const titleLabel = computed(() =>
  isEditMode.value ? 'Editar exce\u00e7\u00e3o' : 'Adicionar exce\u00e7\u00e3o',
);
const submitLabel = computed(() =>
  isEditMode.value ? 'Atualizar exce\u00e7\u00e3o' : 'Salvar exce\u00e7\u00e3o',
);

const showDateError = computed(() => isSubmitted.value && !form.data);
const showTimeError = computed(() => {
  if (!isSubmitted.value) {
    return false;
  }
  if (form.fechado) {
    return false;
  }
  return !form.hora_abertura || !form.hora_fechamento;
});

const syncForm = () => {
  const source = props.initialData || {};
  const horaAbertura = source.hora_abertura ?? '';
  const horaFechamento = source.hora_fechamento ?? '';
  const hasTimes = Boolean(horaAbertura || horaFechamento);

  form.data = source.data ?? '';
  form.hora_abertura = horaAbertura;
  form.hora_fechamento = horaFechamento;
  form.motivo = source.motivo ?? '';
  form.fechado = Boolean(source.fechado ?? (isEditMode.value ? !hasTimes : false));
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
  if (showDateError.value || showTimeError.value) {
    return;
  }
  emit('save', {
    data: form.data,
    hora_abertura: form.fechado ? null : form.hora_abertura,
    hora_fechamento: form.fechado ? null : form.hora_fechamento,
    fechado: form.fechado,
    motivo: form.motivo,
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

.form-field--wide {
  grid-column: span 2;
}

.form-field--toggle {
  align-items: flex-start;
}

.form-error {
  font-size: 0.75rem;
  color: var(--dash-danger, #ef4444);
}

.toggle {
  position: relative;
  width: 52px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--dash-border, #e6e9ef);
  transition: background 0.2s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 6px 14px -6px rgba(15, 23, 42, 0.35);
  transition: transform 0.2s ease;
}

.toggle input:checked + .toggle-slider {
  background: var(--dash-primary, #ff7a00);
}

.toggle input:checked + .toggle-slider::after {
  transform: translateX(24px);
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

  .form-field--wide {
    grid-column: span 1;
  }

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
