// S0 placeholder: proves theme, i18n and RTL wiring. Replaced by real screens from S1 on.
import type { AppId, ThemePreference } from '@istigaba/config';
import type { Language } from '@istigaba/i18n';
import { Text } from '@istigaba/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useLanguageStore } from '../stores/language.store';
import { useThemeStore } from '../stores/theme.store';

const APP: AppId = 'citizen';
const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGES: Language[] = ['ar', 'en'];

/** Selection is shown by border + weight + accessibilityState, never by colour alone. */
function Choice(props: { label: string; selected: boolean; onPress: () => void }) {
  const box = props.selected ? 'border-selected-border bg-surface-selected' : 'border-border';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: props.selected }}
      onPress={props.onPress}
      hitSlop={8}
      className={`min-h-11 justify-center rounded-md border px-4 ${box}`}
    >
      <Text variant="label" weight={props.selected ? 700 : 500}>
        {props.label}
      </Text>
    </Pressable>
  );
}

export function HomePlaceholder() {
  const { t } = useTranslation();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <View className="flex-1 gap-6 bg-background p-6">
      <Text variant="headline" accessibilityRole="header">
        {t(`apps:${APP}`)}
      </Text>
      <Text className="text-start">{t('common:foundationReady')}</Text>
      <View className="flex-row flex-wrap gap-2" accessibilityLabel={t('theme:label')}>
        {THEMES.map((p) => (
          <Choice
            key={p}
            label={t(`theme:${p}`)}
            selected={preference === p}
            onPress={() => setPreference(p)}
          />
        ))}
      </View>
      <View className="flex-row flex-wrap gap-2" accessibilityLabel={t('language:label')}>
        {LANGUAGES.map((l) => (
          <Choice
            key={l}
            label={t(`language:${l}`)}
            selected={language === l}
            onPress={() => setLanguage(l)}
          />
        ))}
      </View>
    </View>
  );
}
