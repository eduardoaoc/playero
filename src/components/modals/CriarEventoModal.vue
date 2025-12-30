<template>
  <div v-if="open" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-card" @click.stop>
      <header class="modal-header">
        <div>
          <p class="modal-eyebrow">Novo evento</p>
          <h3 class="modal-title">Criar evento</h3>
        </div>
        <button class="modal-close" type="button" @click="emitClose">
          <DashboardIcon name="x" />
        </button>
      </header>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <label class="form-field" :class="{ 'has-error': showNomeError }">
            <span>Nome do evento</span>
            <input v-model="form.nome" type="text" placeholder="Nome do evento" />
            <small v-if="showNomeError" class="form-error">Informe o nome do evento.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showTipoError }">
            <span>Tipo do evento</span>
            <select v-model="form.tipo">
              <option value="" disabled>Selecione o tipo</option>
              <option v-for="tipo in tipoOptions" :key="tipo" :value="tipo">
                {{ tipo }}
              </option>
            </select>
            <small v-if="showTipoError" class="form-error">Selecione o tipo do evento.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showDataError }">
            <span>Data do evento</span>
            <input v-model="form.data" type="date" />
            <small v-if="showDataError" class="form-error">Informe uma data válida.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showInicioError || showTimeRangeError }">
            <span>Hora início</span>
            <input v-model="form.hora_inicio" type="time" />
            <small v-if="showInicioError" class="form-error">Informe a hora início.</small>
          </label>
          <label class="form-field" :class="{ 'has-error': showFimError || showTimeRangeError }">
            <span>Hora fim</span>
            <input v-model="form.hora_fim" type="time" />
            <small v-if="showFimError" class="form-error">Informe a hora fim.</small>
            <small v-else-if="showTimeRangeError" class="form-error">
              A hora fim deve ser maior que a hora início.
            </small>
          </label>
          <label class="form-field" :class="{ 'has-error': showLocalError }">
            <span>Local do evento</span>
            <select v-model="form.local">
              <option value="" disabled>Selecione o local</option>
              <option v-for="local in localOptions" :key="local" :value="local">
                {{ local }}
              </option>
            </select>
            <small v-if="showLocalError" class="form-error">Selecione o local do evento.</small>
          </label>
          <label class="form-field">
            <span>Número máximo de pessoas</span>
            <input v-model="form.capacidade" type="number" min="1" placeholder="Ex.: 120" />
          </label>
          <label class="form-field">
            <span>Evento privado ou público</span>
            <select v-model="form.privacidade">
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </label>
          <label class="form-field">
            <span>Status inicial</span>
            <select v-model="form.status">
              <option value="ativo">Ativo</option>
              <option value="cancelado">Cancelado</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </label>
          <label class="form-field form-field--toggle">
            <span>Evento pago?</span>
            <div class="toggle">
              <input id="evento-pago" v-model="form.pago" type="checkbox" />
              <span class="toggle-slider" aria-hidden="true"></span>
            </div>
          </label>
          <label v-if="form.pago" class="form-field" :class="{ 'has-error': showValorError }">
            <span>Valor do evento</span>
            <input v-model="form.valor" type="number" min="0" step="0.01" placeholder="0,00" />
            <small v-if="showValorError" class="form-error">Informe o valor do evento.</small>
          </label>
          <label class="form-field form-field--wide">
            <span>Descrição / observações</span>
            <textarea v-model="form.descricao" rows="3" placeholder="Detalhes do evento"></textarea>
          </label>
        </div>

        <div class="modal-actions">
          <button class="dash-action dash-action--ghost" type="button" @click="emitClose">
            Cancelar
          </button>
          <button class="dash-action dash-action--primary" type="submit" :disabled="isSaving">
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar evento</span>
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
  tipo: '',
  data: '',
  hora_inicio: '',
  hora_fim: '',
  local: '',
  capacidade: '',
  descricao: '',
  pago: false,
  valor: '',
  privacidade: 'publico',
  status: 'ativo',
});

const tipoOptions = [
  'Reserva de Área VIP',
  'Aniversário',
  'Evento corporativo',
  'Evento gastronômico',
  'Música ao vivo / cantores / DJ',
  'Evento personalizado',
];

const localOptions = ['Quadra', 'Área VIP', 'Bar', 'Restaurante', 'Área Kids', 'Chillout'];

const isSaving = ref(false);
const isSubmitted = ref(false);

const isValidDate = (value) => {
  if (!value) {
    return false;
  }
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
};

const showNomeError = computed(() => isSubmitted.value && !form.nome.trim());
const showTipoError = computed(() => isSubmitted.value && !form.tipo);
const showDataError = computed(() => isSubmitted.value && !isValidDate(form.data));
const showInicioError = computed(() => isSubmitted.value && !form.hora_inicio);
const showFimError = computed(() => isSubmitted.value && !form.hora_fim);
const showLocalError = computed(() => isSubmitted.value && !form.local);
const showValorError = computed(
  () => isSubmitted.value && form.pago && (!form.valor || Number(form.valor) <= 0),
);

const isTimeRangeInvalid = computed(
  () => form.hora_inicio && form.hora_fim && form.hora_inicio >= form.hora_fim,
);
const showTimeRangeError = computed(
  () =>
    isSubmitted.value &&
    !showInicioError.value &&
    !showFimError.value &&
    isTimeRangeInvalid.value,
);

const resetForm = () => {
  form.nome = '';
  form.tipo = '';
  form.data = '';
  form.hora_inicio = '';
  form.hora_fim = '';
  form.local = '';
  form.capacidade = '';
  form.descricao = '';
  form.pago = false;
  form.valor = '';
  form.privacidade = 'publico';
  form.status = 'ativo';
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

const createEvento = async (payload) => {
  // TODO: integrar com o endpoint POST /api/v1/admin/eventos.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return payload;
};

const handleSubmit = async () => {
  isSubmitted.value = true;
  if (
    showNomeError.value ||
    showTipoError.value ||
    showDataError.value ||
    showInicioError.value ||
    showFimError.value ||
    showLocalError.value ||
    showTimeRangeError.value ||
    showValorError.value
  ) {
    return;
  }

  isSaving.value = true;
  const capacidadeMaxima = form.capacidade ? Number(form.capacidade) : null;
  const valorEvento = form.pago && form.valor ? Number(form.valor) : null;

  const payload = {
    nome: form.nome.trim(),
    tipo: form.tipo,
    data: form.data,
    hora_inicio: form.hora_inicio,
    hora_fim: form.hora_fim,
    local: form.local,
    capacidade_maxima: Number.isNaN(capacidadeMaxima) ? null : capacidadeMaxima,
    descricao: form.descricao.trim(),
    pago: form.pago,
    valor: Number.isNaN(valorEvento) ? null : valorEvento,
    privacidade: form.privacidade,
    status: form.status,
  };

  try {
    await createEvento(payload);
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

watch(
  () => form.pago,
  (isPaid) => {
    if (!isPaid) {
      form.valor = '';
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

.form-field.has-error input,
.form-field.has-error select,
.form-field.has-error textarea {
  border-color: var(--dash-danger, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
}

.form-field--wide {
  grid-column: span 2;
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

  .form-field--wide {
    grid-column: span 1;
  }

  .modal-actions {
    justify-content: flex-start;
  }
}
</style>
