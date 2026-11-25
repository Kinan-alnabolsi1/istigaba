// Zustand: UI language only (ar | en), persisted in AsyncStorage. Keeps i18next and the
// layout direction (I18nManager) in sync.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_STORAGE_KEY } from '@istigaba/config';
import type { Language } from '@istigaba/i18n';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { applyDirection, deviceLanguage, initI18n } from '../i18n/init';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: deviceLanguage(),
      setLanguage: (language) => {
        set({ language });
        void initI18n(language).changeLanguage(language);
        applyDirection(language);
      },
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) void initI18n(state.language).changeLanguage(state.language);
      },
    },
  ),
);
