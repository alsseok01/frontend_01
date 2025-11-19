let expiryTimerId = null;

const TOKEN_KEY = 'token';
const TOKEN_EXP_KEY = 'token_exp';

const storages = [
  () => window.sessionStorage,
  () => window.localStorage,
];

const parseJwt = (token) => {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
};

const getExpiryFromToken = (token) => {
  const payload = parseJwt(token);
  if (payload && typeof payload.exp === 'number') {
    return payload.exp * 1000;
  }
  return null;
};

const getActiveStorageWithToken = () => {
  for (const getStore of storages) {
    try {
      const store = getStore();
      const token = store.getItem(TOKEN_KEY);
      if (!token) continue;
      const expStr = store.getItem(TOKEN_EXP_KEY);
      if (expStr) {
        const exp = parseInt(expStr, 10);
        if (Number.isFinite(exp) && Date.now() >= exp) {
          store.removeItem(TOKEN_KEY);
          store.removeItem(TOKEN_EXP_KEY);
          continue;
        }
      }
      return store;
    } catch {}
  }
  return null;
};

export const isTokenExpired = () => {
  try {
    const store = getActiveStorageWithToken();
    if (!store) return false;
    const expStr = store.getItem(TOKEN_EXP_KEY);
    if (!expStr) return false;
    const exp = parseInt(expStr, 10);
    return Number.isFinite(exp) && Date.now() >= exp;
  } catch {
    return false;
  }
};

export const getTokenExpiry = () => {
  try {
    const store = getActiveStorageWithToken();
    if (!store) return null;
    const expStr = store.getItem(TOKEN_EXP_KEY);
    if (!expStr) return null;
    const exp = parseInt(expStr, 10);
    return Number.isFinite(exp) ? exp : null;
  } catch {
    return null;
  }
};

export const getToken = () => {
  try {
    const store = getActiveStorageWithToken();
    if (!store) return null;
    return store.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setToken = (token, options = {}) => {
  const { remember = false } = options;
  try {
    if (!token) return;
    const primary = remember ? window.localStorage : window.sessionStorage;
    const secondary = remember ? window.sessionStorage : window.localStorage;
    try { secondary.removeItem(TOKEN_KEY); secondary.removeItem(TOKEN_EXP_KEY); } catch {}
    primary.setItem(TOKEN_KEY, token);
    const exp = getExpiryFromToken(token);
    if (exp) primary.setItem(TOKEN_EXP_KEY, String(exp));
  } catch (e) {
  }
};

export const removeToken = () => {
  try {
    try { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_EXP_KEY); } catch {}
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_EXP_KEY); } catch {}
  } catch (e) {
  }
};

export const startTokenExpiryTimer = (onExpire) => {
  try {
    if (expiryTimerId) {
      clearTimeout(expiryTimerId);
      expiryTimerId = null;
    }
    const activeStore = getActiveStorageWithToken();
    if (!activeStore) return;
    const token = activeStore.getItem(TOKEN_KEY);
    if (!token) return;
    const expStr = activeStore.getItem(TOKEN_EXP_KEY) || String(getExpiryFromToken(token) || '');
    if (!expStr) return;
    const exp = parseInt(expStr, 10);
    if (!Number.isFinite(exp)) return;
    const delay = exp - Date.now();
    if (delay <= 0) {
      removeToken();
      if (typeof onExpire === 'function') onExpire();
      return;
    }
    expiryTimerId = setTimeout(() => {
      removeToken();
      expiryTimerId = null;
      if (typeof onExpire === 'function') onExpire();
      try { sessionStorage.setItem('token_expired_event', String(Date.now())); } catch {}
      try { localStorage.setItem('token_expired_event', String(Date.now())); } catch {}
    }, delay);
  } catch {}
};

export const cancelTokenExpiryTimer = () => {
  if (expiryTimerId) {
    clearTimeout(expiryTimerId);
    expiryTimerId = null;
  }
};
