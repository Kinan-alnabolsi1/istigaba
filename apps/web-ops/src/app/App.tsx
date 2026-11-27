import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { useSessionBootstrap } from '../features/auth';
import { AppProviders } from './providers/AppProviders';
import { createAppRouter } from './router/router';

function AppRoutes() {
  useSessionBootstrap();
  const [router] = useState(createAppRouter);
  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
