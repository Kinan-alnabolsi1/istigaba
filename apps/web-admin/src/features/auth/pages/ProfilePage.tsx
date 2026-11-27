// Own profile (updateMyProfile, D-38).
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '@istigaba/web-ui';
import { ProfileForm } from '@istigaba/web-ui/auth';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api';
import { CURRENT_USER_KEY, useCurrentUser } from '../hooks/useCurrentUser';

export function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t('profile:title')}</CardTitle>
      </CardHeader>
      {me ? (
        <ProfileForm
          key={me.id}
          initial={me}
          onSubmit={async (values) => {
            const updated = await api.request('patch', '/me', { body: values });
            queryClient.setQueryData(CURRENT_USER_KEY, updated);
          }}
        />
      ) : (
        <p role="status">{t('common:loading')}</p>
      )}
    </Card>
  );
}
