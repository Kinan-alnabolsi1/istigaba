import { isAxiosError } from 'axios';

/**
 * Normalised API error: every frontend handles this one shape.
 * Mirrors the contract error body `{code, message, request_id}` (+ `errors` on 422).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly request_id: string | null;
  readonly errors: Record<string, string[]> | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    request_id: string | null;
    errors?: Record<string, string[]> | undefined;
    retryAfterSeconds?: number | undefined;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.request_id = init.request_id;
    this.errors = init.errors;
    this.retryAfterSeconds = init.retryAfterSeconds;
  }
}

interface ContractErrorBody {
  code: string;
  message: string;
  request_id?: string;
  errors?: Record<string, string[]>;
}

function isContractErrorBody(value: unknown): value is ContractErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.code === 'string' && typeof v.message === 'string';
}

function header(headers: unknown, name: string): string | undefined {
  if (typeof headers !== 'object' || headers === null) return undefined;
  const h = headers as Record<string, unknown> & { get?: (n: string) => unknown };
  const raw = typeof h.get === 'function' ? h.get(name) : (h[name] ?? h[name.toLowerCase()]);
  return typeof raw === 'string' ? raw : undefined;
}

function parseRetryAfter(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

/** Converts anything thrown by Axios into an ApiError. Never includes request or response bodies in the message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const response = error.response;
    if (!response) {
      return new ApiError({
        status: 0,
        code: 'network_error',
        message: 'Network error',
        request_id: null,
      });
    }
    const body: unknown = response.data;
    const requestId = header(response.headers, 'x-request-id') ?? null;
    const retryAfterSeconds = parseRetryAfter(header(response.headers, 'retry-after'));
    if (isContractErrorBody(body)) {
      return new ApiError({
        status: response.status,
        code: body.code,
        message: body.message,
        request_id: body.request_id ?? requestId,
        errors: body.errors,
        retryAfterSeconds,
      });
    }
    return new ApiError({
      status: response.status,
      code: 'unknown_error',
      message: `HTTP ${response.status}`,
      request_id: requestId,
      retryAfterSeconds,
    });
  }
  return new ApiError({
    status: 0,
    code: 'unknown_error',
    message: 'Unexpected error',
    request_id: null,
  });
}
