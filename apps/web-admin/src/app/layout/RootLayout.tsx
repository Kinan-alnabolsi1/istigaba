import { LanguageSwitcher, ThemeSwitcher } from '@istigaba/web-ui';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { useLanguageStore } from '../../stores/language.store';
import { useThemeStore } from '../../stores/theme.store';

export function RootLayout() {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-topbar px-6 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold">{t('common:appName')}</span>
          <h1 className="text-base font-bold text-text-secondary">{t('apps:admin')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeSwitcher
            value={preference}
            onChange={setPreference}
            labels={{
              label: t('theme:label'),
              system: t('theme:system'),
              light: t('theme:light'),
              dark: t('theme:dark'),
            }}
          />
          <LanguageSwitcher
            value={language}
            onChange={setLanguage}
            labels={{ label: t('language:label'), ar: t('language:ar'), en: t('language:en') }}
          />
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
