import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiPath } from '@istigaba/api-types';
import { ApiError, toApiError } from './errors';
import type {
  HttpMethod,
  MethodsOf,
  Operation,
  PathParams,
  QueryParams,
  RequestBody,
  SuccessBody,
} from './types';

export type Language = 'ar' | 'en';

export interface ApiClientOptions {
  /** e.g. `http://127.0.0.1:8000/api/v1` (real API) or `http://127.0.0.1:4010` (Prism). */
  baseURL: string;
  /** Current access token (kept in memory by the app), or null when signed out. */
  getAccessToken: () => string | null;
  /** Performs the refresh-token rotation and returns the new access token. Throw on failure. */
  refresh: () => Promise<string>;
  /** Called once when refresh fails: the app clears its session and shows sign-in. */
  onSessionExpired?: () => void;
  /** Current UI language, sent as Accept-Language (API default is `ar`). */
  getLanguage: () => Language;
  /** Path of the refresh operation; requests to it are never refreshed/retried. */
  refreshPath?: string;
  /** UUID v4 generator for Idempotency-Key. Defaults to `crypto.randomUUID`. */
  generateId?: () => string;
  timeoutMs?: number;
}

type RetriableConfig = InternalAxiosRequestConfig & { _istigabaRetried?: boolean };

export type RequestOptions<O> = (PathParams<O> extends undefined
  ? { path?: undefined }
  : { path: PathParams<O> }) & {
  query?: QueryParams<O>;
  body?: RequestBody<O>;
  config?: AxiosRequestConfig;
};

export interface ApiClient {
  /** The configured Axios instance (interceptors installed). */
  readonly http: AxiosInstance;
  /** Typed call: method + path template from the contract; returns the 2xx JSON body. */
  request<P extends ApiPath, M extends MethodsOf<P>>(
    method: M,
    path: P,
    options?: RequestOptions<Operation<P, M>>,
  ): Promise<SuccessBody<Operation<P, M>>>;
  /** Returns `config` with an `Idempotency-Key` header (D-10). Pass `key` to reuse one on retries. */
  withIdempotencyKey<C extends AxiosRequestConfig>(config?: C, key?: string): C;
}

function defaultId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  throw new Error('No UUID generator available: pass generateId to createApiClient');
}

function fillPath(template: string, params: Record<string, unknown> | undefined): string {
  return template.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined || value === null || value === '') {
      throw new Error(`Missing path parameter: ${name}`);
    }
    return encodeURIComponent(String(value));
  });
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const refreshPath = options.refreshPath ?? '/auth/refresh';
  const generateId = options.generateId ?? defaultId;
  const http = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeoutMs ?? 30_000,
    headers: { Accept: 'application/json' },
  });

  http.interceptors.request.use((config) => {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Accept-Language', options.getLanguage());
    const token = options.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    else headers.delete('Authorization');
    config.headers = headers;
    return config;
  });

  // One refresh in flight at a time; concurrent 401s wait for it, then retry once.
  let refreshing: Promise<string> | null = null;
  const isRefreshCall = (config: InternalAxiosRequestConfig | undefined): boolean =>
    (config?.url ?? '').replace(/\?.*$/, '').endsWith(refreshPath);

  http.interceptors.response.use(undefined, async (error: unknown) => {
    const apiError = toApiError(error);
    const config = (axios.isAxiosError(error) ? error.config : undefined) as
      RetriableConfig | undefined;

    if (apiError.status !== 401 || !config || isRefreshCall(config)) throw apiError;
    if (config._istigabaRetried) {
      options.onSessionExpired?.();
      throw apiError;
    }

    try {
      refreshing ??= options.refresh().finally(() => {
        refreshing = null;
      });
      await refreshing;
    } catch {
      options.onSessionExpired?.();
      throw apiError;
    }

    config._istigabaRetried = true;
    return http.request(config);
  });

  return {
    http,
    async request(method, path, opts) {
      const o = (opts ?? {}) as {
        path?: Record<string, unknown>;
        query?: unknown;
        body?: unknown;
        config?: AxiosRequestConfig;
      };
      const url = fillPath(path, o.path);
      const response = await http.request({
        ...o.config,
        method: method as HttpMethod,
        url,
        params: o.query,
        data: o.body,
      });
      return response.data as never;
    },
    withIdempotencyKey(config, key) {
      const c = (config ?? {}) as AxiosRequestConfig;
      const headers = AxiosHeaders.from(c.headers as AxiosHeaders | undefined);
      headers.set('Idempotency-Key', key ?? generateId());
      return { ...c, headers } as typeof config & AxiosRequestConfig as never;
    },
  };
}

export { ApiError };
