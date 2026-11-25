// The only localStorage access in the web apps (CLAUDE.md §9): theme and language preferences.
// Tokens, report data and identity must never be written here (enforced by ESLint).
import type { LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY } from '@istigaba/config';

type PreferenceKey = typeof THEME_STORAGE_KEY | typeof LANGUAGE_STORAGE_KEY;

export function readPreference(key: PreferenceKey): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // private mode / blocked storage: fall back to defaults
  }
}

export function writePreference(key: PreferenceKey, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference simply isn't remembered.
  }
}
