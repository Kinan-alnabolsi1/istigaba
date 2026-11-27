import { namespaces, resources, type Language } from '@istigaba/i18n';
import { render } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

/** Renders inside a real i18next instance with the shared resources. */
export function renderWithI18n(ui: ReactElement, lng: Language = 'ar') {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    ns: namespaces,
    defaultNS: 'common',
    lng,
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return render(<I18nextProvider i18n={instance}>{ui}</I18nextProvider>);
}
