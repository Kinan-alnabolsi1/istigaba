// Theme and language switchers shared by web-ops and web-admin. No strings here: labels are passed
// in from @istigaba/i18n by the app. Selection is shown by text weight + border + aria-pressed,
// never by colour alone.
import type { ThemePreference } from '@istigaba/config';
import type { Language } from '@istigaba/i18n';
import { cn } from '../lib/utils';

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string; lang?: string }[];
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex gap-1 rounded-md border border-border p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.lang}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-9 rounded-sm border px-3 text-sm',
              selected
                ? 'border-selected-border bg-surface-selected font-bold text-foreground'
                : 'border-transparent text-muted-foreground hover:bg-state-hover',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeSwitcher(props: {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
  labels: { label: string; system: string; light: string; dark: string };
}) {
  const { labels } = props;
  return (
    <Segmented
      label={labels.label}
      value={props.value}
      onChange={props.onChange}
      options={[
        { value: 'system', label: labels.system },
        { value: 'light', label: labels.light },
        { value: 'dark', label: labels.dark },
      ]}
    />
  );
}

export function LanguageSwitcher(props: {
  value: Language;
  onChange: (value: Language) => void;
  labels: { label: string; ar: string; en: string };
}) {
  const { labels } = props;
  return (
    <Segmented
      label={labels.label}
      value={props.value}
      onChange={props.onChange}
      options={[
        { value: 'ar', label: labels.ar, lang: 'ar' },
        { value: 'en', label: labels.en, lang: 'en' },
      ]}
    />
  );
}
