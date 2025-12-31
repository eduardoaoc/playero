import { reactive, readonly } from 'vue';

const state = reactive({
  items: [],
});

let seed = 0;

const removeToast = (id) => {
  const index = state.items.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.items.splice(index, 1);
  }
};

const pushToast = (type, message, options = {}) => {
  const id = (seed += 1);
  const item = {
    id,
    type,
    message: message ? String(message) : '',
    title: options.title ? String(options.title) : '',
    duration: typeof options.duration === 'number' ? options.duration : 4200,
  };

  state.items.push(item);

  if (item.duration > 0 && typeof window !== 'undefined') {
    window.setTimeout(() => removeToast(id), item.duration);
  }

  return id;
};

export const useToast = () => ({
  toastState: readonly(state),
  success: (message, options) => pushToast('success', message, options),
  error: (message, options) => pushToast('error', message, options),
  info: (message, options) => pushToast('info', message, options),
  remove: removeToast,
  clear: () => state.items.splice(0, state.items.length),
});
