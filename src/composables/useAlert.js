import { reactive, readonly } from 'vue';

const defaultState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'Ok',
  cancelText: 'Cancelar',
  isConfirm: false,
  allowOutsideClick: true,
  allowEscape: true,
};

const state = reactive({ ...defaultState });
let resolver = null;

const resolvePending = (value) => {
  if (resolver) {
    resolver(value);
    resolver = null;
  }
};

const normalizeType = (value, fallback = 'info') => {
  const allowed = ['info', 'success', 'warning', 'error', 'confirm'];
  if (allowed.includes(value)) {
    return value;
  }
  return fallback;
};

const resolveTitle = (type, provided) => {
  if (provided && String(provided).trim()) {
    return String(provided);
  }
  const titles = {
    info: 'Informacao',
    success: 'Sucesso',
    warning: 'Atencao',
    error: 'Erro',
    confirm: 'Confirmacao',
  };
  return titles[type] || 'Aviso';
};

const openAlert = (options = {}, isConfirm = false) => {
  const type = normalizeType(options.type, isConfirm ? 'confirm' : 'info');
  state.type = type;
  state.title = resolveTitle(type, options.title);
  state.message = options.message ? String(options.message) : '';
  state.confirmText = options.confirmText ? String(options.confirmText) : isConfirm ? 'Confirmar' : 'Ok';
  state.cancelText = options.cancelText ? String(options.cancelText) : 'Cancelar';
  state.isConfirm = isConfirm;
  state.allowOutsideClick = options.allowOutsideClick ?? !isConfirm;
  state.allowEscape = options.allowEscape ?? true;
  state.isOpen = true;
};

const showAlert = (options = {}) => {
  resolvePending(false);
  openAlert(options, false);
};

const showConfirm = (options = {}) => {
  resolvePending(false);
  return new Promise((resolve) => {
    resolver = resolve;
    openAlert(options, true);
  });
};

const closeAlert = (result = false) => {
  state.isOpen = false;
  resolvePending(result);
};

const confirmAlert = () => closeAlert(true);
const cancelAlert = () => closeAlert(false);

export const useAlert = () => ({
  alertState: readonly(state),
  showAlert,
  showConfirm,
  closeAlert,
  confirmAlert,
  cancelAlert,
});
