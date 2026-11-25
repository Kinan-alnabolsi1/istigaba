// Zustand: theme preference only (system | light | dark). AsyncStorage holds this preference and
// the language, nothing else (CLAUDE.md §9: never tokens, report data or identity).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_STORAGE_KEY, type ThemePreference } from '@istigaba/config';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ preference: state.preference }),
    },
  ),
);
