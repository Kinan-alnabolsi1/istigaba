// Change own password (changeMyPassword, D-38): the session switches to the returned token pair.
import { Card, CardHeader, CardTitle } from '@istigaba/web-ui';
import { ChangePasswordForm } from '@istigaba/web-ui/auth';
import { useTranslation } from 'react-i18next';
import { api, session } from '../../../lib/api';

export function ChangePasswordPage() {
  const { t } = useTranslation();

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t('password:title')}</CardTitle>
      </CardHeader>
      <ChangePasswordForm
        onSubmit={async (values) => {
          session.applyTokenPair(await api.request('post', '/me/password', { body: values }));
        }}
      />
    </Card>
  );
}
