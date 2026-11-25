// NativeWind v4 theme provider (DESIGN_TOKENS.md §9.5, decision B4). Same API as the v5 variant
// in §9.4, so screens do not change when NativeWind 5 becomes final.
import {
  colorsFor,
  cssVars,
  type AppId,
  type ColorToken,
  type Scheme,
  type ThemePreference,
} from '@istigaba/config';
import type { Language } from '@istigaba/i18n';
import { colorScheme, useColorScheme, vars } from 'nativewind';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { View } from 'react-native';

interface ThemeContextValue {
  scheme: Scheme;
  app: AppId;
  lang: Language;
}

const ThemeContext = createContext<ThemeContextValue>({
  scheme: 'light',
  app: 'citizen',
  lang: 'ar',
});

const themes = {
  light: vars(cssVars('light')),
  dark: vars(cssVars('dark')),
};

export function ThemeProvider({
  preference,
  app,
  lang,
  children,
}: {
  preference: ThemePreference;
  app: AppId;
  lang: Language;
  children: ReactNode;
}) {
  useEffect(() => {
    colorScheme.set(preference); // 'system' | 'light' | 'dark'
  }, [preference]);
  const scheme: Scheme = useColorScheme().colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ scheme, app, lang }}>
      <View testID="istigaba-theme-root" style={themes[scheme]} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export const useScheme = (): Scheme => useContext(ThemeContext).scheme;
export const useLang = (): Language => useContext(ThemeContext).lang;

/** JS colour values for props that cannot take className (StatusBar, SVG fill, MapLibre paint). */
export function useTokens(): Record<ColorToken, string> {
  const { scheme, app } = useContext(ThemeContext);
  return colorsFor(scheme, app);
}
