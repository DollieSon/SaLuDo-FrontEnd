import { buildApiUrl, getApiBaseUrl } from './backendUrl';

// =======================
// AUTHENTICATED FETCH
// =======================
// Every API route requires a Bearer token, so all fetch-based API calls go
// through authFetch: it adds the stored access token, and on a 401 refreshes
// it once via the HttpOnly refresh-token cookie and retries the request.
// =======================

const API_BASE_URL = getApiBaseUrl();
const AUTH_ENDPOINTS = ['users/auth/login', 'users/auth/refresh'];
const PUBLIC_PREFIX = `${API_BASE_URL}public/`;

// Older sessions kept the refresh token in localStorage; it is sent once so the
// server can move it into the HttpOnly cookie, then removed.
const LEGACY_REFRESH_TOKEN_KEY = 'refreshToken';

let refreshPromise: Promise<string | null> | null = null;

const resolveUrl = (input: RequestInfo | URL): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

const isApiRequest = (url: string) => url.startsWith(API_BASE_URL);
const isAuthEndpoint = (url: string) => AUTH_ENDPOINTS.some((path) => url.includes(path));

export const clearStoredAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
};

const redirectToLogin = () => {
  clearStoredAuth();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Get a new access token using the HttpOnly refresh cookie.
 * Concurrent callers share one request. Returns null when the session is over.
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const legacyRefreshToken = localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY);
      const response = await fetch(buildApiUrl('users/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}),
      });
      localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);

      if (!response.ok) return null;
      const data = await response.json();
      const newAccessToken: string | undefined = data?.data?.accessToken;
      if (!data?.success || !newAccessToken) return null;

      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

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

  const response = await fetch(input, withAuthHeader(init, localStorage.getItem('accessToken')));
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
