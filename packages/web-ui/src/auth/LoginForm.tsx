// Login form (FR-002) shared by web-ops and web-admin. Data access stays in the app: `onSubmit`
// performs the login and throws the normalised ApiError on failure.
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PasswordField, TextField } from '../components/form-field';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { errorMessage } from './error-message';
import { loginSchema, type LoginValues } from './schemas';

export interface LoginFormProps {
  appName: string;
  onSubmit: (values: LoginValues) => Promise<void>;
  notice?: 'session_expired' | null | undefined;
}

export function LoginForm({ appName, onSubmit, notice }: LoginFormProps) {
  const { t } = useTranslation();
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSubmit({ email: values.email.trim(), password: values.password });
    } catch (error) {
      setFailure(errorMessage(t, error));
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('auth:signInTitle')}</CardTitle>
        <CardDescription>{t('auth:signInHint', { app: appName })}</CardDescription>
      </CardHeader>
      {notice === 'session_expired' && failure === null ? (
        <Alert tone="info" role="status">
          {t('auth:sessionExpired')}
        </Alert>
      ) : null}
      {failure !== null ? (
        <Alert tone="danger" role="alert">
          {failure}
        </Alert>
      ) : null}
      <form noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
        <TextField
          label={t('auth:email')}
          type="email"
          autoComplete="username"
          dir="ltr"
          error={errors.email?.message ? t(errors.email.message) : undefined}
          {...register('email')}
        />
        <PasswordField
          label={t('auth:password')}
          showLabel={t('auth:showPassword')}
          hideLabel={t('auth:hidePassword')}
          autoComplete="current-password"
          dir="ltr"
          error={errors.password?.message ? t(errors.password.message) : undefined}
          {...register('password')}
        />
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? t('auth:submitting') : t('auth:submit')}
        </Button>
      </form>
    </Card>
  );
}
