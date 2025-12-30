<template>
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <header class="modal-header">
        <div>
          <p class="modal-eyebrow">Nova reserva</p>
          <h3 class="modal-title">Criar reserva manual</h3>
        </div>
        <button class="modal-close" type="button" @click="emitClose">
          <DashboardIcon name="x" />
        </button>
      </header>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <label class="form-field" :class="{ 'has-error': showClienteError }">
            <span>Cliente</span>
            <input v-model="form.cliente" type="text" placeholder="Nome do cliente" />
            <small v-if="showClienteError" class="form-error">Informe o cliente.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showQuadraError }">
            <span>Quadra</span>
            <input v-model="form.quadra" type="text" placeholder="Quadra 01" />
            <small v-if="showQuadraError" class="form-error">Informe a quadra.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showDataError }">
            <span>Data</span>
            <input v-model="form.data" type="date" />
            <small v-if="showDataError" class="form-error">Informe a data.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showHorarioError }">
            <span>Hor&#225;rio</span>
            <input v-model="form.horario" type="time" />
            <small v-if="showHorarioError" class="form-error">Informe o hor&#225;rio.</small>
          </label>
          <label class="form-field">
            <span>Forma de pagamento</span>
            <select v-model="form.pagamento">
              <option value="PIX">PIX</option>
              <option value="Cartao">Cart&#227;o</option>
              <option value="---">---</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button class="dash-action dash-action--ghost" type="button" @click="emitClose">
            Cancelar
          </button>
          <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar reserva</span>
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
});

const emit = defineEmits(['close', 'created']);

const form = reactive({
  cliente: '',
  quadra: '',
  data: '',
  horario: '',
  pagamento: 'PIX',
});

const isSaving = ref(false);
const isSubmitted = ref(false);

const showClienteError = computed(() => isSubmitted.value && !form.cliente.trim());
const showQuadraError = computed(() => isSubmitted.value && !form.quadra.trim());
const showDataError = computed(() => isSubmitted.value && !form.data);
const showHorarioError = computed(() => isSubmitted.value && !form.horario);

const resetForm = () => {
  form.cliente = '';
  form.quadra = '';
  form.data = '';
  form.horario = '';
  form.pagamento = 'PIX';
  isSubmitted.value = false;
};

const emitClose = () => {
  if (!isSaving.value) {
    emit('close');
  }
};

const handleOverlayClick = () => {
  emitClose();
};

const createReserva = async (payload) => {
  // TODO: integrar com o endpoint POST /api/v1/admin/reservas.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return payload;
};

const handleSubmit = async () => {
  isSubmitted.value = true;
  if (showClienteError.value || showQuadraError.value || showDataError.value || showHorarioError.value) {
    return;
  }
  isSaving.value = true;

  const payload = {
    cliente: form.cliente.trim(),
    quadra: form.quadra.trim(),
    data: form.data,
    horario: form.horario,
    pagamento: form.pagamento,
  };

  try {
    await createReserva(payload);
    emit('created', payload);
    resetForm();
    emit('close');
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      resetForm();
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
  max-width: 760px;
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
  gap: 18px;
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

.form-field input,
.form-field select {
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

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
