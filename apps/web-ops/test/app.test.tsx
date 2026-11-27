import { resources } from '@istigaba/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { useLanguageStore } from '../src/stores/language.store';
import { useThemeStore } from '../src/stores/theme.store';
import { resetApp } from './helpers';

beforeEach(() => {
  resetApp('/');
  useLanguageStore.getState().setLanguage('ar');
  useThemeStore.getState().setPreference('system');
});

describe('NFR-022 web-ops shell', () => {
  it('NFR-022 renders the Operations Room shell in Arabic, right-to-left, by default', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: resources.ar.apps.ops })).toBeInTheDocument();
    // S1: signed out, the shell shows the login page.
    expect(
      await screen.findByRole('heading', { name: resources.ar.auth.signInTitle }),
    ).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('NFR-022 switches to English left-to-right', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: resources.ar.language.en }));

    expect(await screen.findByRole('heading', { name: resources.en.apps.ops })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('NFR-022 switches between light and dark themes and marks the choice without colour alone', async () => {
    render(<App />);
    const dark = await screen.findByRole('button', { name: resources.ar.theme.dark });
    await userEvent.click(dark);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(dark).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: resources.ar.theme.light }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
