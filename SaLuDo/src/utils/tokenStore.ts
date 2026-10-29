// =======================
// ACCESS TOKEN STORE
// =======================
// The access token lives only in memory, never in localStorage, so an XSS bug
// can't lift a stored copy. It lasts 15 minutes: authFetch/apiClient refresh it
// through the HttpOnly refresh cookie, and AuthContext restores it on page load.
// =======================

type AccessTokenListener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<AccessTokenListener>();

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  if (token === accessToken) return;
  accessToken = token;
  listeners.forEach((listener) => listener(token));
};

/**
 * Be told whenever the token changes (login, refresh, logout).
 * Returns an unsubscribe function.
 */
export const subscribeToAccessToken = (listener: AccessTokenListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
