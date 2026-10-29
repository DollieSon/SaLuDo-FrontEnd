import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { getAccessToken, setAccessToken } from '../../utils/tokenStore';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const profile = { userId: 'usr_1', email: 'hr@saludo.test', firstName: 'Hana', role: 'hr_user' };

let auth: ReturnType<typeof useAuth>;
const Probe = () => {
  auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="email">{auth.user?.email ?? ''}</span>
    </div>
  );
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  setAccessToken(null);
  localStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('location', { pathname: '/dashboard', href: '/dashboard' });
});

afterEach(cleanup);

describe('AuthProvider', () => {
  it('restores the session after a page load from the refresh cookie', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true, data: { accessToken: 'restored', user: profile } }));

    renderAuth();

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('email').textContent).toBe(profile.email);
    expect(getAccessToken()).toBe('restored');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });

  it('shows a signed-out state when there is no session', async () => {
    fetchMock.mockResolvedValue(json(401, { success: false }));

    renderAuth();

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('keeps the login token in memory and never writes auth data to localStorage', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { success: false })) // initial restore
      .mockResolvedValueOnce(json(200, { success: true, data: { accessToken: 'login-token', user: profile } }));

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(() => auth.login(profile.email, 'secret'));

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(getAccessToken()).toBe('login-token');
    expect(localStorage.length).toBe(0);
  });

  it('clears the in-memory session on logout', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('users/auth/refresh')
        ? json(200, { success: true, data: { accessToken: 'restored', user: profile } })
        : json(200, { success: true })
    );

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    await act(() => auth.logout());

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(getAccessToken()).toBeNull();
    const logoutCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('users/auth/logout'));
    expect(logoutCall?.[1].credentials).toBe('include');
  });

  it('follows tokens refreshed by API calls', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true, data: { accessToken: 'first', user: profile } }));
    renderAuth();
    await waitFor(() => expect(auth.accessToken).toBe('first'));

    act(() => setAccessToken('second'));

    expect(auth.accessToken).toBe('second');
  });
});
