import { ApiError } from '@istigaba/api-client';
import { resources } from '@istigaba/i18n';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm, LoginForm, ProfileForm } from '../src/auth';
import { renderWithI18n } from './i18n-wrapper';

const ar = resources.ar;
const en = resources.en;

const apiError = (status: number, code: string, extra: Partial<ApiError> = {}) =>
  new ApiError({ status, code, message: code, request_id: 'req-1', ...extra });

async function fillLogin(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(ar.auth.email), email);
  await userEvent.type(screen.getByLabelText(ar.auth.password), password);
  await userEvent.click(screen.getByRole('button', { name: ar.auth.submit }));
}

describe('FR-002 LoginForm', () => {
  it('FR-002 submits email and password', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithI18n(<LoginForm appName="Ops" onSubmit={onSubmit} />);

    await fillLogin('dana@example.com', 'password-123');

    expect(onSubmit).toHaveBeenCalledWith({ email: 'dana@example.com', password: 'password-123' });
  });

  it('FR-002 validates on the client before calling the API', async () => {
    const onSubmit = vi.fn();
    renderWithI18n(<LoginForm appName="Ops" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(ar.auth.email), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: ar.auth.submit }));

    const email = screen.getByLabelText(ar.auth.email);
    expect(await screen.findByText(ar.validation.email)).toBeInTheDocument();
    expect(screen.getByText(ar.validation.required)).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(email.getAttribute('aria-describedby')!)).toHaveTextContent(
      ar.validation.email,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['invalid_credentials', 401, ar.errors.invalid_credentials],
    ['account_deactivated', 403, ar.errors.account_deactivated],
    ['wrong_app_role', 403, ar.errors.wrong_app_role],
    ['rate_limited', 429, ar.errors.rate_limited],
    ['network_error', 0, ar.errors.network_error],
  ])('FR-002 shows the localized message for %s', async (code, status, message) => {
    renderWithI18n(
      <LoginForm appName="Ops" onSubmit={vi.fn().mockRejectedValue(apiError(status, code))} />,
    );

    await fillLogin('dana@example.com', 'password-123');

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  it('NFR-011 shows the lockout countdown in minutes with Arabic plural forms', async () => {
    renderWithI18n(
      <LoginForm
        appName="Ops"
        onSubmit={vi
          .fn()
          .mockRejectedValue(apiError(429, 'account_locked', { retryAfterSeconds: 541 }))}
      />,
    );

    await fillLogin('dana@example.com', 'password-123');

    // 541 s rounds up to 10 minutes: Arabic "few" form.
    expect(await screen.findByRole('alert')).toHaveTextContent(
      ar.auth.lockedMinutes_few.replace('{{count}}', '10'),
    );
  });

  it('NFR-022 renders in English', async () => {
    renderWithI18n(
      <LoginForm
        appName="Ops"
        onSubmit={vi.fn().mockRejectedValue(apiError(401, 'invalid_credentials'))}
      />,
      'en',
    );

    await userEvent.type(screen.getByLabelText(en.auth.email), 'dana@example.com');
    await userEvent.type(screen.getByLabelText(en.auth.password), 'password-123');
    await userEvent.click(screen.getByRole('button', { name: en.auth.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.errors.invalid_credentials);
  });

  it('FR-002 shows the session-expired notice', () => {
    renderWithI18n(<LoginForm appName="Ops" onSubmit={vi.fn()} notice="session_expired" />);

    expect(screen.getByRole('status')).toHaveTextContent(ar.auth.sessionExpired);
  });

  it('NFR-022 the password visibility toggle is labelled, not an icon only', async () => {
    renderWithI18n(<LoginForm appName="Ops" onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(ar.auth.password);

    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: ar.auth.showPassword }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: ar.auth.hidePassword })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('D-38 ProfileForm', () => {
  const initial = { full_name: 'Dana', email: 'dana@example.com', phone: '+963933123456' };

  it('D-38 sends the edited fields and sends null for an emptied phone', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithI18n(<ProfileForm initial={initial} onSubmit={onSubmit} />);

    await userEvent.clear(screen.getByLabelText(ar.profile.phone));
    await userEvent.click(screen.getByRole('button', { name: ar.profile.save }));

    expect(onSubmit).toHaveBeenCalledWith({
      full_name: 'Dana',
      email: 'dana@example.com',
      phone: null,
    });
    expect(await screen.findByRole('status')).toHaveTextContent(ar.profile.saved);
  });

  it('D-38 validates the E.164 phone format on the client', async () => {
    const onSubmit = vi.fn();
    renderWithI18n(<ProfileForm initial={initial} onSubmit={onSubmit} />);

    await userEvent.clear(screen.getByLabelText(ar.profile.phone));
    await userEvent.type(screen.getByLabelText(ar.profile.phone), '0933123456');
    await userEvent.click(screen.getByRole('button', { name: ar.profile.save }));

    expect(await screen.findByText(ar.validation.phone)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['email_taken', ar.profile.email, ar.errors.email_taken],
    ['phone_taken', ar.profile.phone, ar.errors.phone_taken],
  ])('FR-001 D-38 maps 409 %s to its field', async (code, label, message) => {
    renderWithI18n(
      <ProfileForm initial={initial} onSubmit={vi.fn().mockRejectedValue(apiError(409, code))} />,
    );

    await userEvent.click(screen.getByRole('button', { name: ar.profile.save }));

    await waitFor(() =>
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('D-38 maps 422 field errors from the server', async () => {
    renderWithI18n(
      <ProfileForm
        initial={initial}
        onSubmit={vi
          .fn()
          .mockRejectedValue(
            apiError(422, 'validation_failed', { errors: { full_name: ['server says no'] } }),
          )}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: ar.profile.save }));

    expect(await screen.findByText('server says no')).toBeInTheDocument();
  });
});

describe('D-38 ChangePasswordForm', () => {
  async function fill(current: string, next: string, confirm: string) {
    await userEvent.type(screen.getByLabelText(ar.password.current), current);
    await userEvent.type(screen.getByLabelText(ar.password.new), next);
    await userEvent.type(screen.getByLabelText(ar.password.confirm), confirm);
    await userEvent.click(screen.getByRole('button', { name: ar.password.submit }));
  }

  it('NFR-006 D-38 submits current and new password', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithI18n(<ChangePasswordForm onSubmit={onSubmit} />);

    await fill('old-password', 'new-password-1', 'new-password-1');

    expect(onSubmit).toHaveBeenCalledWith({
      current_password: 'old-password',
      new_password: 'new-password-1',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(ar.password.changed);
  });

  it('NFR-006 D-38 checks the minimum length and the confirmation on the client', async () => {
    const onSubmit = vi.fn();
    renderWithI18n(<ChangePasswordForm onSubmit={onSubmit} />);

    await fill('old-password', 'short', 'different');

    expect(await screen.findByText(ar.validation.passwordMin)).toBeInTheDocument();
    expect(screen.getByText(ar.password.mismatch)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('NFR-006 D-38 maps invalid_current_password to the current-password field', async () => {
    renderWithI18n(
      <ChangePasswordForm
        onSubmit={vi.fn().mockRejectedValue(apiError(422, 'invalid_current_password'))}
      />,
    );

    await fill('wrong-password', 'new-password-1', 'new-password-1');

    await waitFor(() =>
      expect(screen.getByLabelText(ar.password.current)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByText(ar.errors.invalid_current_password)).toBeInTheDocument();
  });
});
