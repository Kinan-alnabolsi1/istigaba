// The app's single API client and auth session (CLAUDE.md §9: Axios only through
// @istigaba/api-client). Tokens are held by @istigaba/web-ui/auth: access token in memory, refresh
// token in sessionStorage. web-ops accepts only the Dispatcher role (docs/plans/S1.md §5).
import { createWebAuthSession } from '@istigaba/web-ui/auth';
import { useLanguageStore } from '../stores/language.store';

/** The only role allowed to use this console; any other is rejected and logged out. */
export const APP_ROLE = 'Dispatcher' as const;

/** i18n key of this console's name. */
export const APP_NAME_KEY = 'apps:ops' as const;

export const session = createWebAuthSession({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  appRole: APP_ROLE,
  getLanguage: () => useLanguageStore.getState().language,
});

export const api = session.api;
