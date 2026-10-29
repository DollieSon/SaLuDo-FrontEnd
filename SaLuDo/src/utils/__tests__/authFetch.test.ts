import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authFetch, clearStoredAuth, refreshSession } from '../authFetch';
import { getAccessToken, setAccessToken, subscribeToAccessToken } from '../tokenStore';
import { getApiBaseUrl } from '../backendUrl';

const API = getApiBaseUrl();

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const refreshOk = (accessToken: string, user = { userId: 'usr_1', email: 'a@b.c' }) =>
  json(200, { success: true, data: { accessToken, user } });

const authHeaderOf = (init?: RequestInit) => new Headers(init?.headers).get('Authorization');

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  setAccessToken(null);
  localStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('location', { pathname: '/dashboard', href: '/dashboard' });
});

describe('tokenStore', () => {
  it('keeps the token in memory only and notifies subscribers', () => {
    const seen: (string | null)[] = [];
    const unsubscribe = subscribeToAccessToken((token) => seen.push(token));

    setAccessToken('abc');
    setAccessToken('abc'); // unchanged: no notification
    setAccessToken(null);
    unsubscribe();
    setAccessToken('ignored');

    expect(seen).toEqual(['abc', null]);
    expect(localStorage.length).toBe(0);
  });
});

describe('authFetch', () => {
  it('sends the in-memory access token to the API', async () => {
    setAccessToken('token-1');
    fetchMock.mockResolvedValue(json(200, {}));

    await authFetch(`${API}candidates`);

    expect(authHeaderOf(fetchMock.mock.calls[0][1])).toBe('Bearer token-1');
  });

  it('never sends the token to other hosts or to the public applicant endpoints', async () => {
    setAccessToken('token-1');
    fetchMock.mockResolvedValue(json(200, {}));

    await authFetch('https://api.qrserver.com/v1/create-qr-code/');
    await authFetch(`${API}public/jobs/123`);

    for (const [, init] of fetchMock.mock.calls) {
      expect(authHeaderOf(init)).toBeNull();
    }
  });

  it('refreshes once on a 401 and retries with the new token', async () => {
    setAccessToken('expired');
    fetchMock
      .mockResolvedValueOnce(json(401, {}))
      .mockResolvedValueOnce(refreshOk('fresh'))
      .mockResolvedValueOnce(json(200, { ok: true }));

    const res = await authFetch(`${API}jobs`, { headers: { Authorization: 'Bearer expired' } });

    expect(res.status).toBe(200);
    const [refreshUrl, refreshInit] = fetchMock.mock.calls[1];
    expect(refreshUrl).toBe(`${API}users/auth/refresh`);
    expect(refreshInit.credentials).toBe('include');
    expect(authHeaderOf(fetchMock.mock.calls[2][1])).toBe('Bearer fresh');
    expect(getAccessToken()).toBe('fresh');
  });

  it('shares one refresh between concurrent 401s', async () => {
    setAccessToken('expired');
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('users/auth/refresh')) return refreshOk('fresh');
      return authHeaderOf(init) === 'Bearer fresh' ? json(200, {}) : json(401, {});
    });

    await Promise.all([authFetch(`${API}jobs`), authFetch(`${API}candidates`), authFetch(`${API}skills`)]);

    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('users/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('signs out and goes to /login when the session cannot be refreshed', async () => {
    setAccessToken('expired');
    fetchMock.mockResolvedValueOnce(json(401, {})).mockResolvedValueOnce(json(401, {}));

    const res = await authFetch(`${API}jobs`);

    expect(res.status).toBe(401);
    expect(getAccessToken()).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('sends login requests with credentials so the refresh cookie is stored', async () => {
    fetchMock.mockResolvedValue(json(200, {}));
    await authFetch(`${API}users/auth/login`, { method: 'POST' });
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });
});

describe('refreshSession', () => {
  it('returns the new token and the user profile', async () => {
    fetchMock.mockResolvedValue(refreshOk('fresh', { userId: 'usr_9', email: 'x@y.z' }));

    const session = await refreshSession();

    expect(session).toEqual({ accessToken: 'fresh', user: { userId: 'usr_9', email: 'x@y.z' } });
    expect(getAccessToken()).toBe('fresh');
  });

  it('migrates an old localStorage session once and removes every stored token', async () => {
    localStorage.setItem('refreshToken', 'legacy-refresh');
    localStorage.setItem('accessToken', 'legacy-access');
    localStorage.setItem('user', '{"userId":"usr_1"}');
    fetchMock.mockResolvedValue(refreshOk('fresh'));

    await refreshSession();

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: 'legacy-refresh' });
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('serializes refreshes across tabs with the Web Locks API', async () => {
    const request = vi.fn((_name: string, task: () => Promise<unknown>) => task());
    vi.stubGlobal('navigator', { ...navigator, locks: { request } });
    fetchMock.mockResolvedValue(refreshOk('fresh'));

    await refreshSession();

    expect(request).toHaveBeenCalledWith('saludo-token-refresh', expect.any(Function));
  });

  it('returns null when there is no session', async () => {
    fetchMock.mockResolvedValue(json(401, { success: false }));
    expect(await refreshSession()).toBeNull();
  });

  it('returns null when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await refreshSession()).toBeNull();
  });
});

describe('clearStoredAuth', () => {
  it('drops the in-memory token and any legacy stored auth', () => {
    setAccessToken('abc');
    localStorage.setItem('accessToken', 'legacy');
    localStorage.setItem('playNotificationSound', 'false');

    clearStoredAuth();

    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    // Unrelated preferences are kept
    expect(localStorage.getItem('playNotificationSound')).toBe('false');
  });
});
