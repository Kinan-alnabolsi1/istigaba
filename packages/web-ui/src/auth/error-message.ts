// Maps a normalised ApiError to a localized message (codes → packages/i18n `errors`).
import { isApiError } from '@istigaba/api-client';
import { isKnownErrorCode } from '@istigaba/i18n';
import type { TFunction } from 'i18next';

export function errorMessage(t: TFunction, error: unknown): string {
  if (!isApiError(error)) return t('errors:unknown_error');
  if (error.code === 'account_locked' && error.retryAfterSeconds !== undefined) {
    return t('auth:lockedMinutes', { count: Math.max(1, Math.ceil(error.retryAfterSeconds / 60)) });
  }
  return isKnownErrorCode(error.code) ? t(`errors:${error.code}`) : t('errors:unknown_error');
}

/** Server field errors (422) keyed by field, first message each. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || error.errors === undefined) return {};
  const out: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.errors)) {
    const first = messages[0];
    if (first !== undefined) out[field] = first;
  }
  return out;
}
