import MockAdapter from 'axios-mock-adapter';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient, type ApiClientOptions } from '../src';

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
    generateId: () => '00000000-0000-4000-8000-000000000001',
    ...overrides,
  });
  const mock = new MockAdapter(client.http);
  return { client, mock, refresh, onSessionExpired };
}

describe('S0 api-client headers', () => {
  it('S0 sends Bearer token and Accept-Language on every request', async () => {
    const { client, mock } = setup();
    mock
      .onGet('/me')
      .reply((config) => [
        200,
        { auth: config.headers?.Authorization, lang: config.headers?.['Accept-Language'] },
      ]);
    const res = await client.http.get('/me');
    expect(res.data).toEqual({ auth: 'Bearer access-1', lang: 'ar' });
  });

  it('S0 omits Authorization when there is no token', async () => {
    const { client, mock } = setup({ getAccessToken: () => null });
    mock
      .onGet('/report-types')
      .reply((config) => [200, { auth: config.headers?.Authorization ?? null }]);
    expect((await client.http.get('/report-types')).data).toEqual({ auth: null });
  });

  it('S0 follows the current language for Accept-Language', async () => {
    let lang: 'ar' | 'en' = 'ar';
    const { client, mock } = setup({ getLanguage: () => lang });
    mock.onGet('/me').reply((config) => [200, config.headers?.['Accept-Language']]);
    lang = 'en';
    expect((await client.http.get('/me')).data).toBe('en');
  });

  it('S0 adds Idempotency-Key only when asked (D-10)', async () => {
    const { client, mock } = setup();
    mock
      .onPost('/me/reports/sos')
      .reply((config) => [201, config.headers?.['Idempotency-Key'] ?? null]);
    expect((await client.http.post('/me/reports/sos', {})).data).toBeNull();
    expect((await client.http.post('/me/reports/sos', {}, client.withIdempotencyKey())).data).toBe(
      '00000000-0000-4000-8000-000000000001',
    );
    expect(
      (await client.http.post('/me/reports/sos', {}, client.withIdempotencyKey({}, 'fixed-key')))
        .data,
    ).toBe('fixed-key');
  });

  it('S0 passes upload progress callbacks through', async () => {
    const { client, mock } = setup();
    const onUploadProgress = vi.fn();
    mock.onPost('/me/reports').reply((config) => [201, typeof config.onUploadProgress]);
    expect((await client.http.post('/me/reports', {}, { onUploadProgress })).data).toBe('function');
  });
});

describe('S0 api-client refresh rotation', () => {
  it('S0 refreshes once for concurrent 401s and retries each request once', async () => {
    const { client, mock, refresh } = setup();
    mock
      .onGet(/\/item\/\d/)
      .reply((config) =>
        config.headers?.Authorization === 'Bearer access-2'
          ? [200, config.url]
          : [401, { code: 'unauthenticated', message: 'x', request_id: 'r1' }],
      );
    const results = await Promise.all([1, 2, 3].map((n) => client.http.get(`/item/${n}`)));
    expect(results.map((r) => r.data)).toEqual(['/item/1', '/item/2', '/item/3']);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('S0 signals session expiry when refresh fails and rejects with unauthenticated', async () => {
    const refresh = vi.fn(async () => {
      throw new Error('refresh rejected');
    });
    const { client, mock, onSessionExpired } = setup({ refresh });
    mock.onGet('/me').reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r1' });
    const err = await client.http.get('/me').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe('unauthenticated');
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('S0 never tries to refresh when the refresh call itself returns 401', async () => {
    const { client, mock, refresh } = setup();
    mock
      .onPost('/auth/refresh')
      .reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r2' });
    await expect(client.http.post('/auth/refresh', {})).rejects.toBeInstanceOf(ApiError);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('S0 does not retry a request twice if the new token is also rejected', async () => {
    const { client, mock, refresh, onSessionExpired } = setup();
    mock.onGet('/me').reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r3' });
    await expect(client.http.get('/me')).rejects.toMatchObject({ status: 401 });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});

describe('S0 api-client error normalisation', () => {
  it.each([
    [403, 'forbidden'],
    [404, 'not_found'],
    [409, 'invalid_state_transition'],
    [500, 'internal_error'],
  ])('S0 normalises %i to {status, code, message, request_id}', async (status, code) => {
    const { client, mock } = setup();
    mock.onGet('/x').reply(status, { code, message: 'msg', request_id: 'req-9' });
    await expect(client.http.get('/x')).rejects.toMatchObject({
      status,
      code,
      message: 'msg',
      request_id: 'req-9',
    });
  });

  it('S0 keeps field errors on 422', async () => {
    const { client, mock } = setup();
    mock
      .onPost('/x')
      .reply(422, {
        code: 'validation_failed',
        message: 'm',
        request_id: 'r',
        errors: { email: ['bad'] },
      });
    await expect(client.http.post('/x', {})).rejects.toMatchObject({
      status: 422,
      errors: { email: ['bad'] },
    });
  });

  it('S0 exposes Retry-After seconds on 429', async () => {
    const { client, mock } = setup();
    mock
      .onPost('/x')
      .reply(429, { code: 'rate_limited', message: 'm', request_id: 'r' }, { 'retry-after': '30' });
    await expect(client.http.post('/x', {})).rejects.toMatchObject({
      status: 429,
      code: 'rate_limited',
      retryAfterSeconds: 30,
    });
  });

  it('S0 maps network failures to network_error with status 0', async () => {
    const { client, mock } = setup();
    mock.onGet('/x').networkError();
    await expect(client.http.get('/x')).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
      request_id: null,
    });
  });

  it('S0 falls back to unknown_error and the X-Request-Id header for non-contract bodies', async () => {
    const { client, mock } = setup();
    mock.onGet('/x').reply(502, '<html>bad gateway</html>', { 'x-request-id': 'hdr-1' });
    await expect(client.http.get('/x')).rejects.toMatchObject({
      status: 502,
      code: 'unknown_error',
      request_id: 'hdr-1',
    });
  });
});

describe('S0 api-client typed request helper', () => {
  it('S0 substitutes path parameters and returns the body', async () => {
    const { client, mock } = setup();
    mock.onGet('/me/reports/abc').reply(200, { id: 'abc' });
    const body = await client.request('get', '/me/reports/{reportId}', {
      path: { reportId: 'abc' },
    });
    expect(body).toEqual({ id: 'abc' });
  });

  it('S0 rejects a missing path parameter before sending', async () => {
    const { client } = setup();
    await expect(
      client.request('get', '/me/reports/{reportId}', { path: {} as { reportId: string } }),
    ).rejects.toThrow(/reportId/);
  });
});
