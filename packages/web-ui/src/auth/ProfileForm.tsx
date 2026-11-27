// Own profile form (updateMyProfile, D-38). 409 email_taken / phone_taken and 422 field errors land
// on their field; other failures show a callout.
import { isApiError } from '@istigaba/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextField } from '../components/form-field';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { errorMessage, fieldErrors } from './error-message';
import { profileSchema, type ProfileFormValues, type ProfileValues } from './schemas';

export interface ProfileFormProps {
  initial: { full_name: string; email: string; phone: string | null };
  onSubmit: (values: ProfileValues) => Promise<void>;
}

const FIELDS = ['full_name', 'email', 'phone'] as const;
const DUPLICATE_FIELD: Record<string, (typeof FIELDS)[number]> = {
  email_taken: 'email',
  phone_taken: 'phone',
};

export function ProfileForm({ initial, onSubmit }: ProfileFormProps) {
  const { t } = useTranslation();
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initial.full_name,
      email: initial.email,
      phone: initial.phone ?? '',
    },
  });

  const message = (key: string | undefined) => (key ? t(key) : undefined);

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    setSaved(false);
    try {
      await onSubmit({
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() === '' ? null : values.phone.trim(),
      });
      setSaved(true);
    } catch (error) {
      const duplicate = isApiError(error) ? DUPLICATE_FIELD[error.code] : undefined;
      if (duplicate !== undefined) {
        setError(duplicate, { message: `errors:${isApiError(error) ? error.code : ''}` });
        return;
      }
      const server = fieldErrors(error);
      let mapped = false;
      for (const field of FIELDS) {
        const text = server[field];
        if (text !== undefined) {
          // Server messages are already localized (Accept-Language): shown as-is.
          setError(field, { message: text });
          mapped = true;
        }
      }
      if (!mapped) setFailure(errorMessage(t, error));
    }
  });

  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
      {failure !== null ? (
        <Alert tone="danger" role="alert">
          {failure}
        </Alert>
      ) : null}
      {saved ? (
        <Alert tone="success" role="status">
          {t('profile:saved')}
        </Alert>
      ) : null}
      <TextField
        label={t('profile:fullName')}
        autoComplete="name"
        dir="auto"
        error={message(errors.full_name?.message)}
        {...register('full_name')}
      />
      <TextField
        label={t('profile:email')}
        type="email"
        autoComplete="email"
        dir="ltr"
        error={message(errors.email?.message)}
        {...register('email')}
      />
      <TextField
        label={t('profile:phone')}
        type="tel"
        autoComplete="tel"
        dir="ltr"
        hint={t('profile:phoneHint')}
        error={message(errors.phone?.message)}
        {...register('phone')}
      />
      <Button type="submit" className="self-start" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? t('profile:saving') : t('profile:save')}
      </Button>
    </form>
  );
}
