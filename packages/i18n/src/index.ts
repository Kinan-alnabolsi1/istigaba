import { ar } from './locales/ar';
import { en } from './locales/en';

export const languages = ['ar', 'en'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'ar';

export const resources = { ar, en } as const;
export const namespaces = Object.keys(ar) as (keyof typeof ar)[];
export type Namespace = (typeof namespaces)[number];
export type { LocaleShape } from './types';

/** Text direction for a language (Arabic is RTL). */
export function dirFor(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Narrow an arbitrary value (storage, device locale) to a supported language. */
export function toLanguage(value: unknown): Language {
  if (typeof value !== 'string') return defaultLanguage;
  const base = value.toLowerCase().split(/[-_]/)[0];
  return base === 'en' ? 'en' : defaultLanguage;
}

/** Error codes that have a localized message in the `errors` namespace. */
export type ErrorCode = keyof typeof ar.errors;
export function isKnownErrorCode(code: string): code is ErrorCode {
  return Object.prototype.hasOwnProperty.call(ar.errors, code);
}
