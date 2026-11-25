// Text picks the font family per language and weight (RN cannot pick a weight inside a custom
// family) and sets an absolute line height (DESIGN_TOKENS.md §9.6).
import { font, lineHeightPx, typeScale, type TypeVariant, type Weight } from '@istigaba/config';
import { Text as RNText, type TextProps } from 'react-native';
import { useLang } from '../theme/ThemeProvider';

export function Text({
  variant = 'body-lg',
  weight,
  style,
  className,
  ...props
}: TextProps & { variant?: TypeVariant; weight?: Weight; className?: string }) {
  const lang = useLang();
  const t = typeScale[variant];
  const family = font.native['latin' in t ? 'en' : lang][weight ?? t.weight];
  return (
    <RNText
      {...props}
      className={`text-foreground ${className ?? ''}`}
      style={[
        {
          fontFamily: family,
          fontSize: t.size,
          lineHeight: lineHeightPx(variant, lang),
          letterSpacing: 'tracking' in t ? t.tracking : 0,
        },
        style,
      ]}
    />
  );
}

/** Numbers, IDs, coordinates, times: Inter, tabular, always LTR. */
export function Num({ style, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      {...props}
      weight={600}
      style={[
        { fontFamily: font.native.en[600], fontVariant: ['tabular-nums'], writingDirection: 'ltr' },
        style,
      ]}
    />
  );
}
