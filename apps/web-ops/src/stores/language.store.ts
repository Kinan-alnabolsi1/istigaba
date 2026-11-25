// Zustand: UI language only (ar | en), persisted as `istigaba-lang`. Keeps i18next in sync.
import { createLanguageStore } from '@istigaba/web-ui/theme';
import { i18next } from '../i18n/init';

export const useLanguageStore = createLanguageStore({
  onChange: (language) => void i18next.changeLanguage(language),
});
