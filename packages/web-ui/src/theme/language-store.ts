// UI language store (Zustand). Persists only the language code; sets <html lang dir>.
import { LANGUAGE_STORAGE_KEY } from '@istigaba/config';
import { dirFor, toLanguage, type Language } from '@istigaba/i18n';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { readPreference, writePreference } from './storage';

export interface LanguageState {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (language: Language) => void;
}

export interface LanguageStoreOptions {
  root?: HTMLElement;
  /** Called on every change, e.g. to call i18next.changeLanguage. */
  onChange?: (language: Language) => void;
}

function apply(root: HTMLElement, language: Language): void {
  root.lang = language;
  root.dir = dirFor(language);
}

export function createLanguageStore(
  options: LanguageStoreOptions = {},
): UseBoundStore<StoreApi<LanguageState>> {
  const root = options.root ?? document.documentElement;
  const initial = toLanguage(readPreference(LANGUAGE_STORAGE_KEY));

  const store = create<LanguageState>()((set) => ({
    language: initial,
    dir: dirFor(initial),
    setLanguage: (language) => {
      writePreference(LANGUAGE_STORAGE_KEY, language);
      set({ language, dir: dirFor(language) });
    },
  }));

  apply(root, initial);
  store.subscribe((state, previous) => {
    apply(root, state.language);
    if (state.language !== previous.language) options.onChange?.(state.language);
  });
  return store;
}
