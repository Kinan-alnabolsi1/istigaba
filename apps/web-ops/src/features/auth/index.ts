// Public surface of the auth feature. Other features import only from this file.
export { RequireAuth } from './components/RequireAuth';
export { UserMenu } from './components/UserMenu';
export { CURRENT_USER_KEY, useCurrentUser } from './hooks/useCurrentUser';
export { useSessionBootstrap } from './hooks/useSessionBootstrap';
export { ChangePasswordPage } from './pages/ChangePasswordPage';
export { LoginPage } from './pages/LoginPage';
export { ProfilePage } from './pages/ProfilePage';
