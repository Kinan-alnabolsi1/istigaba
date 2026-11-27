import { REFRESH_TOKEN_KEY } from '@istigaba/web-ui/auth';
import MockAdapter from 'axios-mock-adapter';
import { session } from '../src/lib/api';

export const ROLE = 'Dispatcher';
export const OTHER_ROLE = 'Citizen';

export function me(role = ROLE, overrides: Record<string, unknown> = {}) {
  return {
    id: '7d1c2b8e-3f4a-4c55-9a11-0e5c6a1b2c3d',
    full_name: 'Dana Haddad',
    email: 'dana@example.com',
    phone: '+963933123456',
    role,
    field_unit: null,
    permissions: [],
    is_active: true,
    location_consent: false,
    location_updated_at: null,
    ...overrides,
  };
}

export function pair(n: number) {
  return {
    access_token: `access-${n}`,
    refresh_token: `refresh-${n}`,
    token_type: 'Bearer',
    expires_in: 900,
  };
}

/** A fresh, signed-out app state at `path` with the HTTP layer mocked. */
export function resetApp(path = '/'): MockAdapter {
  sessionStorage.clear();
  localStorage.clear();
  session.useAuthStore.setState({ status: 'unknown', user: null, notice: null });
  window.history.replaceState({}, '', path);
  return new MockAdapter(session.api.http);
}

export { REFRESH_TOKEN_KEY, session };
