import { computed, reactive } from 'vue';
import { authService } from '../services/authService';
import { clearStoredSession, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './authStorage';

const state = reactive({
  token: '',
  user: null,
  initialized: false,
  loading: false,
});

let listenerBound = false;

const bindLogoutListener = () => {
  if (listenerBound || typeof window === 'undefined') {
    return;
  }
  window.addEventListener('playero:auth-logout', () => {
    state.token = '';
    state.user = null;
  });
  listenerBound = true;
};

const resolveToken = (payload) =>
  payload?.token ?? payload?.data?.token ?? payload?.access_token ?? payload?.data?.access_token ?? '';

export const useAuth = () => {
  bindLogoutListener();

  const isAuthenticated = computed(() => Boolean(state.token));
  const user = computed(() => state.user);
  const role = computed(() => state.user?.role ?? state.user?.perfil ?? state.user?.tipo ?? '');
  const isLoading = computed(() => state.loading);
  const isInitialized = computed(() => state.initialized);

  const init = async () => {
    if (state.initialized) {
      return;
    }
    state.token = getStoredToken();
    state.user = getStoredUser();
    state.initialized = true;

    if (state.token && !state.user) {
      try {
        await me();
      } catch {
        clearStoredSession();
      }
    }
  };

  const setSession = (token, userPayload) => {
    state.token = token || '';
    state.user = userPayload || null;
    setStoredToken(state.token);
    setStoredUser(state.user);
  };

  const login = async (email, password) => {
    state.loading = true;
    try {
      const payload = await authService.login(email, password);
      const token = resolveToken(payload);
      if (!token) {
        throw new Error('Token ausente');
      }
      setSession(token, state.user);
      await me();
      return state.user;
    } finally {
      state.loading = false;
    }
  };

  const me = async () => {
    const payload = await authService.me();
    const userPayload = payload?.data ?? payload?.user ?? payload;
    setSession(state.token, userPayload);
    return state.user;
  };

  const refresh = async () => {
    const payload = await authService.refresh();
    const token = resolveToken(payload);
    if (token) {
      setSession(token, state.user);
    }
    return token;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors and clear session locally.
    } finally {
      clearStoredSession();
      state.token = '';
      state.user = null;
    }
  };

  return {
    state,
    isAuthenticated,
    user,
    role,
    isLoading,
    isInitialized,
    init,
    login,
    me,
    refresh,
    logout,
  };
};
