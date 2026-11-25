import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildTailwindTokens, buildWebCss } from '../src/generate';
import { color, colorsFor, cssVars, shadow, type ColorToken, type Scheme } from '../src/tokens';

const here = dirname(fileURLToPath(import.meta.url));
const schemes: Scheme[] = ['light', 'dark'];

// ---- WCAG 2.x relative luminance (DESIGN_TOKENS.md §12) --------------------
function parse(c: string, over: [number, number, number]): [number, number, number] {
  if (c.startsWith('#')) {
    const n = Number.parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m?.[1]) throw new Error(`unsupported colour ${c}`);
  const [r = 0, g = 0, b = 0, a = 1] = m[1].split(',').map((p) => Number.parseFloat(p));
  return [r * a + over[0] * (1 - a), g * a + over[1] * (1 - a), b * a + over[2] * (1 - a)];
}
function luminance([r, g, b]: [number, number, number]): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
function contrast(fg: string, bg: string, base: string): number {
  const baseRgb = parse(base, [255, 255, 255]);
  const bgRgb = parse(bg, baseRgb);
  const fgRgb = parse(fg, bgRgb);
  const [a, b] = [luminance(fgRgb), luminance(bgRgb)].sort((x, y) => y - x) as [number, number];
  return (a + 0.05) / (b + 0.05);
}

// Pairs from §12 that must hold in BOTH schemes. [foreground, background, minimum]
const TEXT = 4.5;
const UI = 3;
const pairs: [ColorToken, ColorToken, number][] = [
  ['foreground', 'background', TEXT],
  ['foreground', 'card', TEXT],
  ['muted-foreground', 'card', TEXT],
  ['muted-foreground', 'background', TEXT],
  ['text-secondary', 'card', TEXT],
  ['text-placeholder', 'card', TEXT],
  ['link', 'card', TEXT],
  ['primary-foreground', 'primary', TEXT],
  ['destructive-foreground', 'destructive', TEXT],
  ['input', 'card', UI],
  ['ring', 'card', UI],
  ...(['critical', 'high', 'medium', 'low'] as const).map(
    (s) => [`sev-${s}-fg`, `sev-${s}-bg`, TEXT] as [ColorToken, ColorToken, number],
  ),
  ...(['available', 'busy', 'offline'] as const).map(
    (s) => [`avail-${s}-fg`, `avail-${s}-bg`, TEXT] as [ColorToken, ColorToken, number],
  ),
  ...(['progress', 'done', 'closed'] as const).map(
    (s) => [`status-${s}-fg`, `status-${s}-bg`, TEXT] as [ColorToken, ColorToken, number],
  ),
  ...(['info', 'warning', 'danger', 'success'] as const).map(
    (s) => [`callout-${s}-fg`, `callout-${s}-bg`, TEXT] as [ColorToken, ColorToken, number],
  ),
  ['anon-fg', 'anon-bg', TEXT],
  ['anon-banner-fg', 'anon-banner-bg', TEXT],
  ['sos-foreground', 'sos-surface', TEXT],
  ['sensitive-header-fg', 'sensitive-header', TEXT],
  ['map-label', 'map-ground', TEXT],
  ...(['critical', 'high', 'medium', 'low'] as const).map(
    (s) => [`marker-${s}-fill`, 'map-ground', UI] as [ColorToken, ColorToken, number],
  ),
  ...(['available', 'busy', 'offline'] as const).map(
    (s) => [`unit-${s}-fill`, 'map-ground', UI] as [ColorToken, ColorToken, number],
  ),
  ...([1, 2, 3, 4, 5, 6] as const).map(
    (n) => [`chart-${n}`, 'card', UI] as [ColorToken, ColorToken, number],
  ),
];

describe('NFR-022 design tokens (DESIGN_TOKENS.md)', () => {
  it('NFR-022 light and dark define exactly the same colour tokens', () => {
    expect(Object.keys(color.dark).sort()).toEqual(Object.keys(color.light).sort());
    expect(Object.keys(shadow.dark).sort()).toEqual(Object.keys(shadow.light).sort());
  });

  it('NFR-022 no token value is empty', () => {
    for (const s of schemes) for (const v of Object.values(color[s])) expect(v.trim()).not.toBe('');
  });

  it.each(schemes)('NFR-022 %s scheme meets the WCAG contrast pairs of §12', (scheme) => {
    const c = colorsFor(scheme);
    const failures = pairs
      .map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrast(c[fg], c[bg], c.card) }))
      .filter((p) => p.ratio < p.min)
      .map((p) => `${p.fg} on ${p.bg}: ${p.ratio.toFixed(2)} < ${p.min}`);
    expect(failures).toEqual([]);
  });

  it('NFR-022 admin overrides only change the sidebar chrome', () => {
    const admin = colorsFor('light', 'admin');
    const ops = colorsFor('light', 'ops');
    const changed = (Object.keys(ops) as ColorToken[]).filter((k) => admin[k] !== ops[k]);
    expect(changed.every((k) => k.startsWith('sidebar'))).toBe(true);
    expect(changed.length).toBeGreaterThan(0);
  });

  it('NFR-022 cssVars exposes every colour and shadow as a custom property', () => {
    const v = cssVars('dark');
    for (const k of Object.keys(color.dark)) expect(v[`--${k}`]).toBe(color.dark[k as ColorToken]);
    expect(v['--shadow-dialog']).toBe(shadow.dark.dialog);
  });
});

describe('NFR-022 generated theme files', () => {
  it('NFR-022 web CSS declares every token for light (:root) and dark (.dark)', () => {
    const css = buildWebCss();
    const root = css.slice(css.indexOf(':root {'), css.indexOf('.dark {'));
    const dark = css.slice(css.indexOf('.dark {'), css.indexOf('[data-app="admin"]'));
    for (const k of Object.keys(color.light)) {
      expect(root).toContain(`--${k}: ${color.light[k as ColorToken]};`);
      expect(dark).toContain(`--${k}: ${color.dark[k as ColorToken]};`);
      expect(css).toContain(`--color-${k}: var(--${k});`);
    }
  });

  it('NFR-022 committed css/theme.web.css is up to date', () => {
    const committed = readFileSync(join(here, '..', 'css', 'theme.web.css'), 'utf8');
    expect(committed).toBe(buildWebCss());
  });

  it('NFR-022 committed css/tailwind-tokens.json is up to date', () => {
    const committed: unknown = JSON.parse(
      readFileSync(join(here, '..', 'css', 'tailwind-tokens.json'), 'utf8'),
    );
    expect(committed).toEqual(buildTailwindTokens());
  });

  it('NFR-022 tailwind preset maps every colour token to its CSS variable', async () => {
    const { createRequire } = await import('node:module');
    const preset = createRequire(import.meta.url)('../tailwind-preset.cjs') as {
      darkMode: string;
      theme: { extend: { colors: Record<string, string>; borderRadius: Record<string, string> } };
    };
    expect(preset.darkMode).toBe('class');
    for (const k of Object.keys(color.light))
      expect(preset.theme.extend.colors[k]).toBe(`var(--${k})`);
    expect(preset.theme.extend.borderRadius.lg).toBe('12px');
  });
});
