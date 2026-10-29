import { buildApiUrl, getApiBaseUrl } from './backendUrl';
import { getAccessToken, setAccessToken } from './tokenStore';
import type { UserProfile } from '../types/user';

// =======================
// AUTHENTICATED FETCH
// =======================
// Every API route requires a Bearer token, so all fetch-based API calls go
// through authFetch: it adds the in-memory access token, and on a 401 refreshes
// it once via the HttpOnly refresh-token cookie and retries the request.
// =======================

const API_BASE_URL = getApiBaseUrl();
const AUTH_ENDPOINTS = ['users/auth/login', 'users/auth/refresh'];
const PUBLIC_PREFIX = `${API_BASE_URL}public/`;

// Older builds kept the tokens and profile in localStorage. The refresh token
// is sent once so the server can move it into the HttpOnly cookie; all of
// these keys are then removed.
const LEGACY_REFRESH_TOKEN_KEY = 'refreshToken';
const LEGACY_STORAGE_KEYS = ['accessToken', 'user', LEGACY_REFRESH_TOKEN_KEY];

// Tabs share the refresh cookie and every refresh rotates it, so refreshes are
// serialized across tabs; otherwise two tabs could present the same old cookie
// and one of them would be signed out.
const REFRESH_LOCK_NAME = 'saludo-token-refresh';

export interface RefreshedSession {
  accessToken: string;
  user?: UserProfile;
}

let refreshPromise: Promise<RefreshedSession | null> | null = null;

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const removeLegacyStoredAuth = () => {
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable (private mode, blocked): nothing to clean up
    }
  }
};

const resolveUrl = (input: RequestInfo | URL): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

const isApiRequest = (url: string) => url.startsWith(API_BASE_URL);
const isAuthEndpoint = (url: string) => AUTH_ENDPOINTS.some((path) => url.includes(path));

export const clearStoredAuth = () => {
  setAccessToken(null);
  removeLegacyStoredAuth();
};

const redirectToLogin = () => {
  clearStoredAuth();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const withRefreshLock = <T>(task: () => Promise<T>): Promise<T> =>
  typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request(REFRESH_LOCK_NAME, task)
    : task();

/**
 * Get a new access token (and the user's profile) using the HttpOnly refresh
 * cookie. Concurrent callers share one request. Returns null when there is no
 * session.
 */
export const refreshSession = (): Promise<RefreshedSession | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = withRefreshLock(async (): Promise<RefreshedSession | null> => {
    const legacyRefreshToken = readStorage(LEGACY_REFRESH_TOKEN_KEY);
    const response = await fetch(buildApiUrl('users/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}),
    });
    removeLegacyStoredAuth();

    if (!response.ok) return null;
    const data = await response.json();
    const newAccessToken: string | undefined = data?.data?.accessToken;
    if (!data?.success || !newAccessToken) return null;

    setAccessToken(newAccessToken);
    return { accessToken: newAccessToken, user: data.data.user };
  })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * Get a new access token using the HttpOnly refresh cookie, or null when the
 * session is over.
 */
export const refreshAccessToken = async (): Promise<string | null> =>
  (await refreshSession())?.accessToken ?? null;

const withAuthHeader = (init: RequestInit | undefined, token: string | null): RequestInit => {
  const headers = new Headers(init?.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return { ...init, headers };
};

/**
 * Drop-in replacement for fetch() for API calls.
 */
export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = resolveUrl(input);
  // Non-API and public (anonymous applicant) endpoints are passed through untouched
  if (!isApiRequest(url) || url.startsWith(PUBLIC_PREFIX)) {
    return fetch(input, init);
  }

  if (isAuthEndpoint(url)) {
    // Login/refresh must send and receive the refresh cookie
    return fetch(input, { ...init, credentials: 'include' });
  }

  const response = await fetch(input, withAuthHeader(init, getAccessToken()));
  if (response.status !== 401) {
    return response;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    redirectToLogin();
    return response;
  }

  // Retry once with the fresh token (replacing any stale explicit header)
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${newToken}`);
  return fetch(input, { ...init, headers });
};
