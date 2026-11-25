// The app's single API client (CLAUDE.md §9: Axios only through @istigaba/api-client).
// Access token: in memory only. Refresh token: sessionStorage, wired in S1 together with /auth/refresh.
import { createApiClient } from '@istigaba/api-client';
import { useLanguageStore } from '../stores/language.store';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export const api = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  getAccessToken: () => accessToken,
  getLanguage: () => useLanguageStore.getState().language,
  // S1 implements refresh-token rotation; until then a 401 simply ends the session.
  refresh: () => Promise.reject(new Error('Token refresh is implemented in S1')),
  onSessionExpired: () => setAccessToken(null),
});
