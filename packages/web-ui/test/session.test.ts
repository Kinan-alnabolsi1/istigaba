import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { REFRESH_TOKEN_KEY, createWebAuthSession, type WebAuthSession } from '../src/auth';

const me = (role: string) => ({
  id: '7d1c2b8e-3f4a-4c55-9a11-0e5c6a1b2c3d',
  full_name: 'Dana',
  email: 'dana@example.com',
  phone: null,
  role,
  field_unit: null,
  permissions: role === 'Dispatcher' ? ['report.view'] : [],
  is_active: true,
  location_consent: false,
  location_updated_at: null,
});
const pair = (n: number) => ({
  access_token: `access-${n}`,
  refresh_token: `refresh-${n}`,
  token_type: 'Bearer' as const,
  expires_in: 900,
});
const unauthenticated = { code: 'unauthenticated', message: 'x', request_id: 'r' };

let session: WebAuthSession;
let mock: MockAdapter;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  session = createWebAuthSession({
    baseURL: 'http://api.test/api/v1',
    appRole: 'Dispatcher',
    getLanguage: () => 'ar',
  });
  mock = new MockAdapter(session.api.http);
});

afterEach(() => mock.reset());

async function signIn(): Promise<void> {
  mock.onPost('/auth/login').replyOnce(200, pair(1));
  mock.onGet('/me').replyOnce(200, me('Dispatcher'));
  await session.login('dana@example.com', 'password-123');
}

describe('NFR-006 web auth session tokens', () => {
  it('NFR-006 keeps the access token in memory and the refresh token only in sessionStorage', async () => {
    await signIn();

    expect(session.getAccessToken()).toBe('access-1');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
    expect(sessionStorage.length).toBe(1);
    expect(localStorage.length).toBe(0);

    const state = session.useAuthStore.getState();
    expect(state.status).toBe('signedIn');
    expect(state.user).toEqual({
      id: me('x').id,
      role: 'Dispatcher',
      permissions: ['report.view'],
    });
    // The Zustand store holds no token and no profile data.
    expect(JSON.stringify(state)).not.toMatch(/access-1|refresh-1|dana@example.com/);
  });

  it('NFR-006 concurrent 401s refresh once, store the rotated refresh token and retry', async () => {
    await signIn();
    mock.onPost('/auth/refresh').replyOnce(200, pair(2));
    mock
      .onGet(/\/item\/\d/)
      .reply((config) =>
        config.headers?.Authorization === 'Bearer access-2' ? [200, 'ok'] : [401, unauthenticated],
      );

    const results = await Promise.all([1, 2, 3].map((n) => session.api.http.get(`/item/${n}`)));

    expect(results.map((r) => r.data)).toEqual(['ok', 'ok', 'ok']);
    expect(mock.history.post.filter((r) => r.url === '/auth/refresh')).toHaveLength(1);
    expect(JSON.parse(mock.history.post.find((r) => r.url === '/auth/refresh')!.data)).toEqual({
      refresh_token: 'refresh-1',
    });
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-2');
    expect(session.getAccessToken()).toBe('access-2');
  });

  it('NFR-006 a rejected refresh signs out with a session-expired notice and clears the token', async () => {
    await signIn();
    mock.onPost('/auth/refresh').replyOnce(401, unauthenticated);
    mock.onGet('/x').reply(401, unauthenticated);

    await expect(session.api.http.get('/x')).rejects.toMatchObject({ status: 401 });

    expect(session.useAuthStore.getState()).toMatchObject({
      status: 'signedOut',
      user: null,
      notice: 'session_expired',
    });
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(session.getAccessToken()).toBeNull();
  });

  it('NFR-006 D-38 applyTokenPair swaps both tokens (password change)', async () => {
    await signIn();
    session.applyTokenPair(pair(5));

    expect(session.getAccessToken()).toBe('access-5');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-5');
  });
});

describe('FR-004 FR-003 web auth session lifecycle', () => {
  it('FR-004 a login with another role is rejected and revoked server-side', async () => {
    mock.onPost('/auth/login').replyOnce(200, pair(1));
    mock.onGet('/me').replyOnce(200, me('Citizen'));
    mock.onPost('/auth/logout').replyOnce(204);

    await expect(session.login('c@example.com', 'password-123')).rejects.toMatchObject({
      code: 'wrong_app_role',
    });

    const logout = mock.history.post.find((r) => r.url === '/auth/logout');
    expect(logout).toBeDefined();
    expect(JSON.parse(logout!.data)).toEqual({ refresh_token: 'refresh-1' });
    expect(logout!.headers?.Authorization).toBe('Bearer access-1');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(session.getAccessToken()).toBeNull();
    expect(session.useAuthStore.getState().status).toBe('signedOut');
  });

  it('FR-003 logout revokes server-side and clears everything even when the call fails', async () => {
    await signIn();
    mock.onPost('/auth/logout').networkError();

    await session.logout();

    expect(mock.history.post.some((r) => r.url === '/auth/logout')).toBe(true);
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(session.getAccessToken()).toBeNull();
    expect(session.useAuthStore.getState()).toMatchObject({ status: 'signedOut', notice: null });
  });

  it('NFR-006 bootstrap restores a session from the stored refresh token', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-0');
    mock.onPost('/auth/refresh').replyOnce(200, pair(2));
    mock.onGet('/me').replyOnce(200, me('Dispatcher'));

    await session.bootstrap();

    expect(session.useAuthStore.getState().status).toBe('signedIn');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });

  it('NFR-006 concurrent bootstraps (React StrictMode) present the refresh token only once', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-0');
    mock.onPost('/auth/refresh').reply(200, pair(2));
    mock.onGet('/me').reply(200, me('Dispatcher'));

    await Promise.all([session.bootstrap(), session.bootstrap()]);

    // A second use of the same rotating token would be reuse and revoke every session.
    expect(mock.history.post.filter((r) => r.url === '/auth/refresh')).toHaveLength(1);
    expect(session.useAuthStore.getState().status).toBe('signedIn');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });

  it('NFR-006 bootstrap without a refresh token signs out without calling the API', async () => {
    await session.bootstrap();

    expect(session.useAuthStore.getState()).toMatchObject({ status: 'signedOut', notice: null });
    expect(mock.history.post).toHaveLength(0);
  });

  it('FR-004 bootstrap rejects a stored session of another role', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-0');
    mock.onPost('/auth/refresh').replyOnce(200, pair(2));
    mock.onGet('/me').replyOnce(200, me('System Administrator'));
    mock.onPost('/auth/logout').replyOnce(204);

    await session.bootstrap();

    expect(session.useAuthStore.getState().status).toBe('signedOut');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(mock.history.post.some((r) => r.url === '/auth/logout')).toBe(true);
  });

  it('NFR-006 bootstrap with a rejected refresh token clears it', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'stale');
    mock.onPost('/auth/refresh').replyOnce(401, unauthenticated);

    await session.bootstrap();

    expect(session.useAuthStore.getState().status).toBe('signedOut');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });
});
