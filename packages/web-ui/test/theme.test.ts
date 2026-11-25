import { createHash } from 'node:crypto';
import { LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY } from '@istigaba/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_HEAD_SCRIPT, buildCsp, istigabaHead } from '../src/theme/head';
import { createLanguageStore } from '../src/theme/language-store';
import { createThemeStore } from '../src/theme/theme-store';

type Listener = (e: { matches: boolean }) => void;

function fakeMatchMedia(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<Listener>();
  const mql = {
    get matches() {
      return dark;
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
  };
  return {
    matchMedia: vi.fn(() => mql as unknown as MediaQueryList),
    setDark(value: boolean) {
      dark = value;
      for (const l of listeners) l({ matches: value });
    },
  };
}

const root = () => document.documentElement;

beforeEach(() => {
  localStorage.clear();
  root().className = '';
  root().removeAttribute('lang');
  root().removeAttribute('dir');
  root().style.colorScheme = '';
});
afterEach(() => vi.restoreAllMocks());

describe('NFR-022 inline <head> theme script (DESIGN_TOKENS §8.2)', () => {
  function runHeadScript(dark: boolean) {
    vi.stubGlobal('matchMedia', fakeMatchMedia(dark).matchMedia);
    new Function(THEME_HEAD_SCRIPT)();
  }

  it('NFR-022 defaults to system theme and Arabic RTL', () => {
    runHeadScript(true);
    expect(root().classList.contains('dark')).toBe(true);
    expect(root().style.colorScheme).toBe('dark');
    expect(root().lang).toBe('ar');
    expect(root().dir).toBe('rtl');
  });

  it('NFR-022 honours stored light/dark and English before first paint', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    runHeadScript(true);
    expect(root().classList.contains('dark')).toBe(false);
    expect(root().dir).toBe('ltr');
    expect(root().lang).toBe('en');
  });

  it('NFR-022 never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => runHeadScript(false)).not.toThrow();
  });
});

describe('S0 CSP for the inline theme script', () => {
  it('S0 CSP hash matches the inline theme script exactly', () => {
    const hash = createHash('sha256').update(THEME_HEAD_SCRIPT, 'utf8').digest('base64');
    expect(buildCsp({ connectSrc: [] })).toContain(`script-src 'self' 'sha256-${hash}'`);
  });

  const page =
    '<!doctype html><html><head>\n    <meta charset="UTF-8" />\n    <title>t</title></head><body></body></html>';
  const run = (ctx: object) => {
    const plugin = istigabaHead({ connectSrc: ['http://127.0.0.1:8000'] });
    const hook = plugin.transformIndexHtml as { handler: (html: string, ctx: object) => unknown };
    return hook.handler(page, ctx) as string;
  };

  it('S0 build puts charset first, then the CSP meta, then the theme script', () => {
    const html = run({});
    const charset = html.indexOf('<meta charset');
    const csp = html.indexOf('Content-Security-Policy');
    const script = html.indexOf(`<script>${THEME_HEAD_SCRIPT}</script>`);

    expect(charset).toBeGreaterThan(-1);
    expect(charset).toBeLessThan(csp);
    expect(csp).toBeLessThan(script);
    expect(html).toContain("connect-src 'self' http://127.0.0.1:8000");
    expect(html).toContain("object-src 'none'");
  });

  it('S0 dev injects only the theme script (no CSP meta)', () => {
    const html = run({ server: {} });
    expect(html).toContain(`<script>${THEME_HEAD_SCRIPT}</script>`);
    expect(html).not.toContain('Content-Security-Policy');
  });
});

describe('NFR-022 theme store (system | light | dark)', () => {
  it('NFR-022 default system follows the OS and its changes', () => {
    const mm = fakeMatchMedia(false);
    const store = createThemeStore({ matchMedia: mm.matchMedia });
    expect(store.getState()).toMatchObject({ preference: 'system', resolved: 'light' });

    mm.setDark(true);
    expect(store.getState().resolved).toBe('dark');
    expect(root().classList.contains('dark')).toBe(true);
  });

  it('NFR-022 light and dark override the OS', () => {
    const mm = fakeMatchMedia(true);
    const store = createThemeStore({ matchMedia: mm.matchMedia });
    store.getState().setPreference('light');
    expect(store.getState().resolved).toBe('light');
    mm.setDark(true);
    expect(store.getState().resolved).toBe('light');
    store.getState().setPreference('dark');
    expect(root().classList.contains('dark')).toBe(true);
    expect(root().style.colorScheme).toBe('dark');
  });

  it('NFR-022 only the theme preference string is persisted', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const store = createThemeStore({ matchMedia: fakeMatchMedia(false).matchMedia });
    store.getState().setPreference('dark');
    expect(setItem.mock.calls).toEqual([[THEME_STORAGE_KEY, 'dark']]);
  });

  it('NFR-022 ignores unknown stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    const store = createThemeStore({ matchMedia: fakeMatchMedia(false).matchMedia });
    expect(store.getState().preference).toBe('system');
  });
});

describe('NFR-022 language store (ar | en)', () => {
  it('NFR-022 defaults to Arabic RTL and switches <html> lang/dir', () => {
    const onChange = vi.fn();
    const store = createLanguageStore({ onChange });
    expect(store.getState()).toMatchObject({ language: 'ar', dir: 'rtl' });
    expect(root().dir).toBe('rtl');

    store.getState().setLanguage('en');
    expect(root().dir).toBe('ltr');
    expect(root().lang).toBe('en');
    expect(onChange).toHaveBeenLastCalledWith('en');
  });

  it('NFR-022 only the language code is persisted', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    createLanguageStore().getState().setLanguage('en');
    expect(setItem.mock.calls).toEqual([[LANGUAGE_STORAGE_KEY, 'en']]);
  });
});
