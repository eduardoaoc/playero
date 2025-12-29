const TOKEN_KEY = 'playero_token';
const USER_KEY = 'playero_user';

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  if (!isBrowser()) {
    return '';
  }
  return localStorage.getItem(TOKEN_KEY) || '';
};

export const getStoredUser = () => {
  if (!isBrowser()) {
    return null;
  }
  return safeParse(localStorage.getItem(USER_KEY));
};

export const setStoredToken = (token) => {
  if (!isBrowser()) {
    return;
  }
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const setStoredUser = (user) => {
  if (!isBrowser()) {
    return;
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const clearStoredSession = () => {
  setStoredToken('');
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('playero:auth-logout'));
  }
};

export const authStorageKeys = {
  TOKEN_KEY,
  USER_KEY,
};
