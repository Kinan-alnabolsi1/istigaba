// Change own password (changeMyPassword, D-38). The app's onSubmit swaps the session to the
// returned token pair; a wrong current password lands on its field.
import { isApiError } from '@istigaba/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PasswordField } from '../components/form-field';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { errorMessage, fieldErrors } from './error-message';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
  type ChangePasswordValues,
} from './schemas';

export interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordValues) => Promise<void>;
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const [failure, setFailure] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '', confirm: '' },
  });

  const message = (key: string | undefined) => (key ? t(key) : undefined);
  const toggle = { showLabel: t('auth:showPassword'), hideLabel: t('auth:hidePassword') };

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    setChanged(false);
    try {
      await onSubmit({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      reset();
      setChanged(true);
    } catch (error) {
      if (isApiError(error) && error.code === 'invalid_current_password') {
        setError('current_password', { message: 'errors:invalid_current_password' });
        return;
      }
      const server = fieldErrors(error);
      if (server.new_password !== undefined) {
        setError('new_password', { message: server.new_password });
        return;
      }
      setFailure(errorMessage(t, error));
    }
  });

  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
      {failure !== null ? (
        <Alert tone="danger" role="alert">
          {failure}
        </Alert>
      ) : null}
      {changed ? (
        <Alert tone="success" role="status">
          {t('password:changed')}
        </Alert>
      ) : null}
      <PasswordField
        label={t('password:current')}
        autoComplete="current-password"
        dir="ltr"
        {...toggle}
        error={message(errors.current_password?.message)}
        {...register('current_password')}
      />
      <PasswordField
        label={t('password:new')}
        autoComplete="new-password"
        dir="ltr"
        hint={t('password:newHint')}
        {...toggle}
        error={message(errors.new_password?.message)}
        {...register('new_password')}
      />
      <PasswordField
        label={t('password:confirm')}
        autoComplete="new-password"
        dir="ltr"
        {...toggle}
        error={message(errors.confirm?.message)}
        {...register('confirm')}
      />
      <Button type="submit" className="self-start" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? t('password:submitting') : t('password:submit')}
      </Button>
    </form>
  );
}
