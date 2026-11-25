import { useTranslation } from 'react-i18next';

/** S0 placeholder: proves theme, i18n and RTL wiring. Replaced by the users screen in S2. */
export function HomePlaceholder() {
  const { t } = useTranslation();
  return (
    <section className="rounded-lg border border-border bg-card p-6 text-card-foreground">
      <p className="text-start">{t('common:foundationReady')}</p>
    </section>
  );
}
