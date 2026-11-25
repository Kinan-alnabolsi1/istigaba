// i18n initialisation and layout direction only. All strings live in @istigaba/i18n (CLAUDE.md §9).
import { defaultLanguage, namespaces, resources, toLanguage, type Language } from '@istigaba/i18n';
import { reloadAppAsync } from 'expo';
import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

/** Device language, used until the user picks one (Arabic when unsupported). */
export function deviceLanguage(): Language {
  return toLanguage(getLocales()[0]?.languageCode);
}

export function initI18n(language: Language): typeof i18next {
  if (!i18next.isInitialized) {
    void i18next.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: defaultLanguage,
      ns: namespaces,
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  }
  return i18next;
}

/**
 * Arabic is RTL. React Native applies a direction change only after a reload, so reload when the
 * current layout direction does not match the chosen language.
 */
export function applyDirection(language: Language): void {
  const rtl = language === 'ar';
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(rtl);
  if (I18nManager.isRTL !== rtl) void reloadAppAsync();
}

export { i18next };
