// Web auth session shared by web-ops and web-admin (docs/plans/S1.md §4.1, CLAUDE.md §9):
// - access token in memory (this closure), refresh token in sessionStorage (token-storage.ts);
// - Zustand holds session state only (status + id/role/permissions), never tokens or profile data;
// - refresh rotation runs through the api-client's single-flight refresh with queued retry;
// - "reject and log out": a role other than the app's is revoked server-side (POST /auth/logout).
import {
  ApiError,
  createApiClient,
  isApiError,
  type ApiClient,
  type Language,
} from '@istigaba/api-client';
import type { Schema } from '@istigaba/api-types';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from './token-storage';

export type CurrentUser = Schema<'CurrentUser'>;
export type TokenPair = Schema<'TokenPair'>;
export type AppRole = Schema<'RoleName'>;

export interface SessionUser {
  id: string;
  role: AppRole;
  permissions: string[];
}

export type AuthStatus = 'unknown' | 'signedOut' | 'signedIn';

export interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  /** Shown on the login page after an involuntary sign-out. */
  notice: 'session_expired' | null;
}

export interface WebAuthSessionOptions {
  baseURL: string;
  /** The only role this app accepts (web-ops: Dispatcher, web-admin: System Administrator). */
  appRole: AppRole;
  getLanguage: () => Language;
  timeoutMs?: number;
}

export interface WebAuthSession {
  readonly api: ApiClient;
  readonly useAuthStore: UseBoundStore<StoreApi<AuthState>>;
  /** Logs in, checks the role via GET /me and returns the profile (seed the ['me'] query). */
  login(email: string, password: string): Promise<CurrentUser>;
  /** Revokes the session server-side when possible, then clears everything locally. */
  logout(): Promise<void>;
  /** Restores a session from the stored refresh token on page load. */
  bootstrap(): Promise<CurrentUser | null>;
  /** Replaces both tokens, e.g. with the pair returned by a password change. */
  applyTokenPair(pair: TokenPair): void;
  getAccessToken(): string | null;
}

export function wrongAppRole(): ApiError {
  return new ApiError({
    status: 403,
    code: 'wrong_app_role',
    message: 'wrong_app_role',
    request_id: null,
  });
}

export function createWebAuthSession(options: WebAuthSessionOptions): WebAuthSession {
  let accessToken: string | null = null;

  const useAuthStore = create<AuthState>()(() => ({
    status: 'unknown',
    user: null,
    notice: null,
  }));

  function applyTokenPair(pair: TokenPair): void {
    accessToken = pair.access_token;
    writeRefreshToken(pair.refresh_token);
  }

  function clearLocal(notice: AuthState['notice'] = null): void {
    accessToken = null;
    clearRefreshToken();
    useAuthStore.setState({ status: 'signedOut', user: null, notice });
  }

  // Single-flight: a rotating refresh token must never be presented twice. Two concurrent
  // presentations look like token theft to the API, which then revokes every session of the user.
  let refreshing: Promise<string> | null = null;

  function refresh(): Promise<string> {
    refreshing ??= (async () => {
      const refreshToken = readRefreshToken();
      if (refreshToken === null) {
        throw new ApiError({
          status: 401,
          code: 'unauthenticated',
          message: 'no session',
          request_id: null,
        });
      }
      const pair = await api.request('post', '/auth/refresh', {
        body: { refresh_token: refreshToken },
      });
      applyTokenPair(pair);
      return pair.access_token;
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  let booting: Promise<CurrentUser | null> | null = null;

  const api = createApiClient({
    baseURL: options.baseURL,
    getAccessToken: () => accessToken,
    getLanguage: options.getLanguage,
    refresh,
    onSessionExpired: () => clearLocal('session_expired'),
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
  });

  async function revokeQuietly(): Promise<void> {
    const refreshToken = readRefreshToken();
    if (refreshToken !== null && accessToken !== null) {
      try {
        await api.request('post', '/auth/logout', { body: { refresh_token: refreshToken } });
      } catch {
        // Offline or already expired: the local session is cleared anyway.
      }
    }
  }

  /** GET /me, then accept only the app's role. */
  async function establish(): Promise<CurrentUser> {
    const me = await api.request('get', '/me');
    if (me.role !== options.appRole) {
      await revokeQuietly();
      clearLocal();
      throw wrongAppRole();
    }
    useAuthStore.setState({
      status: 'signedIn',
      user: { id: me.id, role: me.role, permissions: [...me.permissions] },
      notice: null,
    });
    return me;
  }

  return {
    api,
    useAuthStore,
    getAccessToken: () => accessToken,
    applyTokenPair,

    async login(email, password) {
      const pair = await api.request('post', '/auth/login', { body: { email, password } });
      applyTokenPair(pair);
      try {
        return await establish();
      } catch (error) {
        if (!isApiError(error) || error.code !== 'wrong_app_role') clearLocal();
        throw error;
      }
    },

    async logout() {
      await revokeQuietly();
      clearLocal();
    },

    bootstrap() {
      // Concurrent callers (e.g. React StrictMode's double effect) share one restore.
      booting ??= (async () => {
        if (readRefreshToken() === null) {
          clearLocal();
          return null;
        }
        try {
          await refresh();
          return await establish();
        } catch {
          clearLocal();
          return null;
        }
      })().finally(() => {
        booting = null;
      });
      return booting;
    },
  };
}
