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

// ── S1 (NFR-006) ────────────────────────────────────────────────────────────
import type { ApiErrorCode, Operation, SuccessBody } from '../src';

type IsNever<T> = [T] extends [never] ? true : false;

// 204-only operations resolve to void, not never (code after `await` stays reachable).
export const logoutIsNotNever: IsNever<SuccessBody<Operation<'/auth/logout', 'post'>>> = false;
export const consentIsNotNever: IsNever<SuccessBody<Operation<'/me/location-consent', 'put'>>> =
  false;
export const locationIsNotNever: IsNever<SuccessBody<Operation<'/me/location', 'put'>>> = false;
// 200 bodies are unchanged.
export const loginHasBody: IsNever<SuccessBody<Operation<'/auth/login', 'post'>>> = false;

// ApiErrorCode lists the S1 codes and rejects typos.
export const s1Codes: ApiErrorCode[] = [
  'invalid_credentials',
  'account_locked',
  'account_deactivated',
  'email_taken',
  'phone_taken',
  'invalid_current_password',
  'location_consent_required',
  'network_error',
  'unknown_error',
];
// @ts-expect-error not a known error code
export const typo: ApiErrorCode = 'invalid_credential';
