import { createBrowserRouter } from 'react-router';
import { HomePlaceholder } from '../layout/HomePlaceholder';
import { RootLayout } from '../layout/RootLayout';

// Feature routes are added per slice, importing pages only from each feature's index.ts.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [{ index: true, element: <HomePlaceholder /> }],
  },
]);
