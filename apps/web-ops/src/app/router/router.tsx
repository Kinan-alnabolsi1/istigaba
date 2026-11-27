import { createBrowserRouter } from 'react-router';
import { ChangePasswordPage, LoginPage, ProfilePage, RequireAuth } from '../../features/auth';
import { HomePlaceholder } from '../layout/HomePlaceholder';
import { RootLayout } from '../layout/RootLayout';

// Feature routes are added per slice, importing pages only from each feature's index.ts.
// Everything except /login requires a signed-in Dispatcher (UX only; the API enforces it).
export function createAppRouter() {
  return createBrowserRouter([
    {
      element: <RootLayout />,
      children: [
        { path: 'login', element: <LoginPage /> },
        {
          element: <RequireAuth />,
          children: [
            { index: true, element: <HomePlaceholder /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'profile/password', element: <ChangePasswordPage /> },
          ],
        },
      ],
    },
  ]);
}
