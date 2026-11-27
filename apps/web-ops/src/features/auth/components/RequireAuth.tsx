// Route guard (UX only: the backend enforces every permission). Signed-out users go to /login.
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router';
import { session } from '../../../lib/api';

export function RequireAuth() {
  const { t } = useTranslation();
  const status = session.useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'unknown') {
    return (
      <p role="status" className="text-start text-muted-foreground">
        {t('auth:checkingSession')}
      </p>
    );
  }
  if (status === 'signedOut') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
