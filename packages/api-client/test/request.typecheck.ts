// Type-level tests for ApiClient.request (checked by `pnpm typecheck`, not run).
import type { ApiClient } from '../src';

export function typeTests(client: ApiClient): void {
  // valid: GET with path param
  void client.request('get', '/me/reports/{reportId}', { path: { reportId: 'r' } });
  // valid: SOS create carries a typed body
  void client.request('post', '/me/reports/sos', {
    body: {} as never,
    config: client.withIdempotencyKey(),
  });

  // @ts-expect-error unknown path
  void client.request('get', '/nope');
  // @ts-expect-error method not defined for this path
  void client.request('delete', '/me/reports/sos');
  // @ts-expect-error wrong path parameter name
  void client.request('get', '/me/reports/{reportId}', { path: { id: 'r' } });
}
