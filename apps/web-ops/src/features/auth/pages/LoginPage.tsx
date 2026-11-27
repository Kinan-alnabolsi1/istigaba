// FR-002 login. A role other than this console's is rejected and logged out by the session.
import { useQueryClient } from '@tanstack/react-query';
import { LoginForm } from '@istigaba/web-ui/auth';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { APP_NAME_KEY, session } from '../../../lib/api';
import { CURRENT_USER_KEY } from '../hooks/useCurrentUser';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const status = session.useAuthStore((s) => s.status);
  const notice = session.useAuthStore((s) => s.notice);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  if (status === 'signedIn') return <Navigate to={from} replace />;

  return (
    <div className="flex justify-center py-8">
      <LoginForm
        appName={t(APP_NAME_KEY)}
        notice={notice}
        onSubmit={async ({ email, password }) => {
          const me = await session.login(email, password);
          queryClient.setQueryData(CURRENT_USER_KEY, me);
          await navigate(from, { replace: true });
        }}
      />
    </div>
  );
}
