// Own profile (GET /me) as server state. Seeded by login/bootstrap; never copied into Zustand.
import { useQuery } from '@tanstack/react-query';
import { api, session } from '../../../lib/api';

export const CURRENT_USER_KEY = ['me'] as const;

export function useCurrentUser() {
  const signedIn = session.useAuthStore((s) => s.status === 'signedIn');
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: () => api.request('get', '/me'),
    enabled: signedIn,
    // Login and bootstrap seed this query; do not refetch it immediately.
    staleTime: 60_000,
  });
}
