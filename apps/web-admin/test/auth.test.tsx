import { resources } from '@istigaba/i18n';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { useLanguageStore } from '../src/stores/language.store';
import { OTHER_ROLE, REFRESH_TOKEN_KEY, ROLE, me, pair, resetApp, session } from './helpers';

const ar = resources.ar;
const en = resources.en;
let mock: MockAdapter;

beforeEach(() => {
  useLanguageStore.getState().setLanguage('ar');
  mock = resetApp('/');
});
afterEach(() => mock.restore());

async function signIn(email = 'dana@example.com', password = 'password-123') {
  await userEvent.type(await screen.findByLabelText(ar.auth.email), email);
  await userEvent.type(screen.getByLabelText(ar.auth.password), password);
  await userEvent.click(screen.getByRole('button', { name: ar.auth.submit }));
}

describe('FR-002 login', () => {
  it('FR-002 a protected route sends a signed-out user to the login page', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: ar.auth.signInTitle })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('FR-002 a System Administrator signs in and reaches the console', async () => {
    mock.onPost('/auth/login').replyOnce(200, pair(1));
    mock.onGet('/me').reply(200, me());
    render(<App />);

    await signIn();

    expect(await screen.findByText(ar.common.foundationReady)).toBeInTheDocument();
    expect(screen.getByText('Dana Haddad')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('FR-002 wrong credentials show the localized message in Arabic and English', async () => {
    mock
      .onPost('/auth/login')
      .reply(401, { code: 'invalid_credentials', message: 'x', request_id: 'r' });
    render(<App />);

    await signIn();
    expect(await screen.findByRole('alert')).toHaveTextContent(ar.errors.invalid_credentials);

    await userEvent.click(screen.getByRole('button', { name: ar.language.en }));
    await userEvent.click(screen.getByRole('button', { name: en.auth.submit }));
    expect(await screen.findByRole('alert')).toHaveTextContent(en.errors.invalid_credentials);
    // A failed login is a final answer: no refresh attempt.
    expect(mock.history.post.some((r) => r.url === '/auth/refresh')).toBe(false);
  });

  it('NFR-011 a lockout shows the minutes from Retry-After', async () => {
    mock
      .onPost('/auth/login')
      .reply(
        429,
        { code: 'account_locked', message: 'x', request_id: 'r' },
        { 'retry-after': '120' },
      );
    render(<App />);

    await signIn();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      ar.auth.lockedMinutes_two.replace('{{count}}', '2'),
    );
  });

  it(`FR-004 a ${OTHER_ROLE} account is rejected and logged out server-side`, async () => {
    mock.onPost('/auth/login').replyOnce(200, pair(1));
    mock.onGet('/me').reply(200, me(OTHER_ROLE));
    mock.onPost('/auth/logout').replyOnce(204);
    render(<App />);

    await signIn();

    expect(await screen.findByRole('alert')).toHaveTextContent(ar.errors.wrong_app_role);
    expect(mock.history.post.some((r) => r.url === '/auth/logout')).toBe(true);
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(window.location.pathname).toBe('/login');
  });

  it('NFR-006 a stored refresh token restores the session on reload', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-0');
    mock.onPost('/auth/refresh').replyOnce(200, pair(2));
    mock.onGet('/me').reply(200, me());
    render(<App />);

    expect(await screen.findByText(ar.common.foundationReady)).toBeInTheDocument();
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });
});

describe('FR-003 logout', () => {
  it('FR-003 signing out revokes the session and protected pages are no longer reachable', async () => {
    mock.onPost('/auth/login').replyOnce(200, pair(1));
    mock.onGet('/me').reply(200, me());
    mock.onPost('/auth/logout').replyOnce(204);
    render(<App />);
    await signIn();
    await screen.findByText(ar.common.foundationReady);

    await userEvent.click(screen.getByRole('button', { name: ar.auth.signOut }));

    expect(await screen.findByRole('heading', { name: ar.auth.signInTitle })).toBeInTheDocument();
    const logout = mock.history.post.find((r) => r.url === '/auth/logout');
    expect(JSON.parse(logout!.data)).toEqual({ refresh_token: 'refresh-1' });
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(session.getAccessToken()).toBeNull();

    // A fresh load of a protected URL now lands on the login page.
    cleanup();
    window.history.replaceState({}, '', '/profile');
    render(<App />);
    expect(await screen.findByRole('heading', { name: ar.auth.signInTitle })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('NFR-006 an expired session returns to login with a notice', async () => {
    mock.onPost('/auth/login').replyOnce(200, pair(1));
    mock.onGet('/me').replyOnce(200, me());
    render(<App />);
    await signIn();
    await screen.findByText(ar.common.foundationReady);

    mock.onPatch('/me').reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r' });
    mock
      .onPost('/auth/refresh')
      .reply(401, { code: 'unauthenticated', message: 'x', request_id: 'r' });
    await userEvent.click(screen.getByRole('link', { name: ar.profile.title }));
    await userEvent.click(await screen.findByRole('button', { name: ar.profile.save }));

    expect(await screen.findByText(ar.auth.sessionExpired)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });
});

describe('D-38 profile and password', () => {
  async function signedInAt(path: string) {
    mock.onPost('/auth/login').replyOnce(200, pair(1));
    mock.onGet('/me').reply(200, me());
    render(<App />);
    await signIn();
    await screen.findByText(ar.common.foundationReady);
    await userEvent.click(screen.getByRole('link', { name: path }));
  }

  it('FR-001 D-38 a duplicate email from the API is shown on the email field', async () => {
    mock.onPatch('/me').reply(409, { code: 'email_taken', message: 'x', request_id: 'r' });
    await signedInAt(ar.profile.title);

    await userEvent.click(await screen.findByRole('button', { name: ar.profile.save }));

    await waitFor(() =>
      expect(screen.getByLabelText(ar.profile.email)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByText(ar.errors.email_taken)).toBeInTheDocument();
  });

  it('D-38 a saved profile updates the name in the header', async () => {
    mock.onPatch('/me').reply(200, me(ROLE, { full_name: 'Dana H.' }));
    await signedInAt(ar.profile.title);

    const name = await screen.findByLabelText(ar.profile.fullName);
    await userEvent.clear(name);
    await userEvent.type(name, 'Dana H.');
    await userEvent.click(screen.getByRole('button', { name: ar.profile.save }));

    expect(await screen.findByRole('status')).toHaveTextContent(ar.profile.saved);
    expect(screen.getByText('Dana H.')).toBeInTheDocument();
    expect(JSON.parse(mock.history.patch[0]!.data)).toMatchObject({ full_name: 'Dana H.' });
  });

  it('NFR-006 D-38 a password change switches the session to the new token pair', async () => {
    mock.onPost('/me/password').replyOnce(200, pair(7));
    await signedInAt(ar.password.title);

    await userEvent.type(await screen.findByLabelText(ar.password.current), 'password-123');
    await userEvent.type(screen.getByLabelText(ar.password.new), 'brand-new-pass');
    await userEvent.type(screen.getByLabelText(ar.password.confirm), 'brand-new-pass');
    await userEvent.click(screen.getByRole('button', { name: ar.password.submit }));

    expect(await screen.findByRole('status')).toHaveTextContent(ar.password.changed);
    expect(session.getAccessToken()).toBe('access-7');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-7');
  });
});
