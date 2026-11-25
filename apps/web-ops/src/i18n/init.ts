// i18n initialisation only. All strings live in @istigaba/i18n (CLAUDE.md §9).
import { defaultLanguage, namespaces, resources, type Language } from '@istigaba/i18n';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export function initI18n(language: Language): typeof i18next {
  void i18next.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: defaultLanguage,
    ns: namespaces,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return i18next;
}

export { i18next };
