// Pure generators for the committed theme files (DESIGN_TOKENS.md §9.3 and §9.5).
// Kept separate from scripts/build-css.ts so tests can call them without touching the disk.
import { appOverrides, color, font, radius, shadow, type Scheme } from './tokens';

const decl = (m: Record<string, string>, pad = '  '): string =>
  Object.entries(m)
    .map(([k, v]) => `${pad}--${k}: ${v};`)
    .join('\n');

const shadows = (s: Scheme): Record<string, string> =>
  Object.fromEntries(Object.entries(shadow[s]).map(([k, v]) => [`shadow-${k}`, v]));

const vars = (s: Scheme): Record<string, string> => ({ ...color[s], ...shadows(s) });

/** `@theme inline` block: maps every token to a Tailwind 4 utility (bg-sev-critical-bg, shadow-dialog, rounded-lg …). */
const themeMap = (): string => `@theme inline {
${Object.keys(color.light)
  .map((k) => `  --color-${k}: var(--${k});`)
  .join('\n')}
${Object.keys(shadow.light)
  .map((k) => `  --shadow-${k}: var(--shadow-${k});`)
  .join('\n')}
${Object.entries(radius)
  .filter(([k]) => k !== 'full')
  .map(([k, v]) => `  --radius-${k}: ${v}px;`)
  .join('\n')}
}`;

/** css/theme.web.css: light on :root, dark on .dark, admin chrome via [data-app="admin"]. */
export function buildWebCss(): string {
  const admin = appOverrides.admin;
  if (!admin?.light || !admin.dark)
    throw new Error('appOverrides.admin must define light and dark');
  return `/* GENERATED from @istigaba/config/src/tokens.ts. Do not edit; run pnpm tokens:build. */
:root {
  color-scheme: light;
  --radius: 0.75rem;
  --font-arabic: ${font.web.arabic};
  --font-latin: ${font.web.latin};
  --font-mono: ${font.web.mono};
  --font-active: var(--font-latin);
  --leading-body: 1.5;
${decl(vars('light'))}
}
.dark {
  color-scheme: dark;
${decl(vars('dark'))}
}
[data-app="admin"] {
${decl(admin.light as Record<string, string>)}
}
.dark[data-app="admin"] {
${decl(admin.dark as Record<string, string>)}
}
:root:lang(ar) { --font-active: var(--font-arabic); --leading-body: 1.6; }

${themeMap()}
@theme inline {
  --font-sans: var(--font-active);
  --font-latin: var(--font-latin);
  --font-arabic: var(--font-arabic);
  --font-mono: var(--font-mono);
}
`;
}

export interface TailwindTokens {
  colors: string[];
  radius: Record<string, string>;
  fontFamily: Record<string, string[]>;
}

/** css/tailwind-tokens.json: consumed by tailwind-preset.js (Tailwind 3 cannot read @theme). */
export function buildTailwindTokens(): TailwindTokens {
  const langs = ['ar', 'en'] as const;
  return {
    colors: Object.keys(color.light),
    radius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, `${v}px`])),
    fontFamily: Object.fromEntries(
      langs.flatMap((l) => Object.entries(font.native[l]).map(([w, f]) => [`${l}-${w}`, [f]])),
    ),
  };
}
