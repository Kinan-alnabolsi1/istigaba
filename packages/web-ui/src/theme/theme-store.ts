// Theme preference store (Zustand, client/UI state only). Persists only the preference string.
import { THEME_STORAGE_KEY, type Scheme, type ThemePreference } from '@istigaba/config';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { readPreference, writePreference } from './storage';

export interface ThemeState {
  preference: ThemePreference;
  resolved: Scheme;
  setPreference: (preference: ThemePreference) => void;
}

export interface ThemeStoreOptions {
  matchMedia?: (query: string) => MediaQueryList;
  root?: HTMLElement;
}

const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

function apply(root: HTMLElement, scheme: Scheme): void {
  root.classList.toggle('dark', scheme === 'dark');
  root.style.colorScheme = scheme;
}

export function createThemeStore(
  options: ThemeStoreOptions = {},
): UseBoundStore<StoreApi<ThemeState>> {
  const media = (options.matchMedia ?? window.matchMedia.bind(window))(DARK_QUERY);
  const root = options.root ?? document.documentElement;
  const stored = readPreference(THEME_STORAGE_KEY);
  const initial: ThemePreference = PREFERENCES.includes(stored as ThemePreference)
    ? (stored as ThemePreference)
    : 'system';
  const resolve = (p: ThemePreference): Scheme =>
    p === 'system' ? (media.matches ? 'dark' : 'light') : p;

  const store = create<ThemeState>()((set) => ({
    preference: initial,
    resolved: resolve(initial),
    setPreference: (preference) => {
      writePreference(THEME_STORAGE_KEY, preference);
      set({ preference, resolved: resolve(preference) });
    },
  }));

  apply(root, store.getState().resolved);
  store.subscribe((state) => apply(root, state.resolved));
  // In `system` mode, follow OS changes live.
  media.addEventListener('change', () => {
    const { preference } = store.getState();
    if (preference === 'system') store.setState({ resolved: resolve('system') });
  });
  return store;
}
