<template>
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <header class="modal-header">
        <div>
          <p class="modal-eyebrow">Nova quadra</p>
          <h3 class="modal-title">Cadastrar nova quadra</h3>
        </div>
        <button class="modal-close" type="button" @click="emitClose">
          <DashboardIcon name="x" />
        </button>
      </header>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <label class="form-field" :class="{ 'has-error': showNameError }">
            <span>Nome da quadra</span>
            <input v-model="form.nome" type="text" placeholder="Quadra 07" />
            <small v-if="showNameError" class="form-error">Informe o nome da quadra.</small>
          </label>

          <label class="form-field">
            <span>Tipo de esporte</span>
            <select v-model="form.esporte">
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Volei">V&#244;lei</option>
              <option value="Footvolley">Footvolley</option>
            </select>
          </label>

          <label class="form-field">
            <span>Status inicial</span>
            <select v-model="form.status">
              <option value="LIVRE">LIVRE</option>
              <option value="MANUTENCAO">MANUTEN&#199;&#195;O</option>
            </select>
          </label>

          <label class="form-field form-field--toggle">
            <span>Ativa</span>
            <div class="toggle">
              <input id="quadra-ativa" v-model="form.ativa" type="checkbox" />
              <span class="toggle-slider" aria-hidden="true"></span>
            </div>
          </label>
        </div>

        <label class="form-field">
          <span>Observa&#231;&#245;es</span>
          <textarea v-model="form.observacoes" rows="3" placeholder="Opcional"></textarea>
        </label>

        <div class="modal-actions">
          <button class="dash-action dash-action--ghost" type="button" @click="emitClose">
            Cancelar
          </button>
          <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar Quadra</span>
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
  nome: '',
  esporte: 'Beach Tennis',
  status: 'LIVRE',
  ativa: true,
  observacoes: '',
});

const isSaving = ref(false);
const isSubmitted = ref(false);

const showNameError = computed(() => isSubmitted.value && !form.nome.trim());

const resetForm = () => {
  form.nome = '';
  form.esporte = 'Beach Tennis';
  form.status = 'LIVRE';
  form.ativa = true;
  form.observacoes = '';
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

const createQuadra = async (payload) => {
  // TODO: integrar com Axios e o endpoint POST /api/v1/quadras.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return payload;
};

const handleSubmit = async () => {
  isSubmitted.value = true;
  if (!form.nome.trim()) {
    return;
  }
  isSaving.value = true;

  const payload = {
    nome: form.nome.trim(),
    esporte: form.esporte,
    status: form.status,
    ativa: form.ativa,
    observacoes: form.observacoes.trim(),
  };

  try {
    await createQuadra(payload);
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

.form-field input,
.form-field select,
.form-field textarea {
  border-radius: 14px;
  border: 1px solid var(--dash-border, #e6e9ef);
  background: var(--dash-surface-soft, #f6f8fb);
  padding: 10px 12px;
  font-size: 0.9rem;
  color: var(--dash-text, #0f172a);
}

.form-field textarea {
  resize: vertical;
  min-height: 90px;
}

.form-field.has-error input {
  border-color: var(--dash-danger, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
}

.form-error {
  font-size: 0.75rem;
  color: var(--dash-danger, #ef4444);
}

.form-field--toggle {
  align-items: flex-start;
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

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
