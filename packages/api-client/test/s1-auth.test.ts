import MockAdapter from 'axios-mock-adapter';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient, isApiError, type ApiClientOptions } from '../src';

const BASE = 'http://api.test/api/v1';

function setup(overrides: Partial<ApiClientOptions> = {}) {
  let token: string | null = 'access-1';
  const refresh = vi.fn(async () => {
    token = 'access-2';
    return token;
  });
  const onSessionExpired = vi.fn();
  const client = createApiClient({
    baseURL: BASE,
    getAccessToken: () => token,
    refresh,
    onSessionExpired,
    getLanguage: () => 'ar',
    ...overrides,
  });
  const mock = new MockAdapter(client.http);
  return { client, mock, refresh, onSessionExpired };
}

const invalidCredentials = { code: 'invalid_credentials', message: 'x', request_id: 'r1' };

describe('S1 api-client auth calls', () => {
  it('NFR-006 does not refresh or expire the session on a login 401', async () => {
    const { client, mock, refresh, onSessionExpired } = setup();
    mock.onPost('/auth/login').reply(401, invalidCredentials);
    await expect(client.http.post('/auth/login', {})).rejects.toMatchObject({
      status: 401,
      code: 'invalid_credentials',
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it.each(['/auth/register', '/auth/logout'])(
    'NFR-006 never refreshes for the public auth call %s',
    async (path) => {
      const { client, mock, refresh } = setup();
      mock.onPost(path).reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r' });
      await expect(client.http.post(path, {})).rejects.toBeInstanceOf(ApiError);
      expect(refresh).not.toHaveBeenCalled();
    },
  );

  it('NFR-006 honours custom noRefreshPaths', async () => {
    const { client, mock, refresh } = setup({ noRefreshPaths: ['/custom'] });
    mock.onGet('/custom').reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r' });
    await expect(client.http.get('/custom')).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('NFR-006 does not refresh a request that carried no Bearer token', async () => {
    const { client, mock, refresh, onSessionExpired } = setup({ getAccessToken: () => null });
    mock.onGet('/me').reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r' });
    await expect(client.http.get('/me')).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('NFR-006 keeps the session when the refresh call fails on the network', async () => {
    const refresh = vi.fn(async () => {
      throw new ApiError({ status: 0, code: 'network_error', message: 'n', request_id: null });
    });
    const { client, mock, onSessionExpired } = setup({ refresh });
    mock.onGet('/me').reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r' });
    await expect(client.http.get('/me')).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
    });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('NFR-006 resolves 204 responses of the typed helper to undefined', async () => {
    const { client, mock } = setup();
    mock.onPost('/auth/logout').reply(204);
    const result = await client.request('post', '/auth/logout', {
      body: { refresh_token: 'r' },
    });
    expect(result).toBeUndefined();
  });
});

describe('S1 api-client error guard', () => {
  it('NFR-006 isApiError narrows normalised errors only', () => {
    const e = new ApiError({
      status: 401,
      code: 'invalid_credentials',
      message: 'm',
      request_id: 'r',
    });
    expect(isApiError(e)).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
    expect(isApiError({ status: 401, code: 'x' })).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
