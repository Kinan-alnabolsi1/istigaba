import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18next, initI18n } from '../../i18n/init';
import { useLanguageStore } from '../../stores/language.store';

initI18n(useLanguageStore.getState().language);

export function AppProviders({ children }: { children: ReactNode }) {
  // TanStack Query holds server state only; client/UI state lives in Zustand stores.
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );
  return (
    <I18nextProvider i18n={i18next}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  );
}
