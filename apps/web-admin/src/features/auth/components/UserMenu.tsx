// Header account navigation: name, profile, password, sign out. Text links, no icon-only controls.
import { Button } from '@istigaba/web-ui';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router';
import { session } from '../../../lib/api';
import { useCurrentUser } from '../hooks/useCurrentUser';

const link =
  'rounded-sm px-2 py-1 text-sm text-foreground underline-offset-4 hover:underline aria-[current=page]:font-bold aria-[current=page]:underline';

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signedIn = session.useAuthStore((s) => s.status === 'signedIn');
  const { data: me } = useCurrentUser();

  if (!signedIn) return null;

  return (
    <nav aria-label={t('auth:account')} className="flex flex-wrap items-center gap-2">
      {me ? <span className="text-sm font-bold">{me.full_name}</span> : null}
      <NavLink to="/profile" end className={link}>
        {t('profile:title')}
      </NavLink>
      <NavLink to="/profile/password" className={link}>
        {t('password:title')}
      </NavLink>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void session.logout().then(() => navigate('/login', { replace: true }));
        }}
      >
        {t('auth:signOut')}
      </Button>
    </nav>
  );
}
