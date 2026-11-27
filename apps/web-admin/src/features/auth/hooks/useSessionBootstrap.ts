// Restores a session from the stored refresh token once on load, and drops all server state
// whenever the session ends (logout, rejected role, expired refresh).
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { session } from '../../../lib/api';
import { CURRENT_USER_KEY } from './useCurrentUser';

export function useSessionBootstrap(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = session.useAuthStore.subscribe((state, previous) => {
      if (state.status === 'signedOut' && previous.status !== 'signedOut') queryClient.clear();
    });
    if (session.useAuthStore.getState().status === 'unknown') {
      void session.bootstrap().then((me) => {
        if (me !== null) queryClient.setQueryData(CURRENT_USER_KEY, me);
      });
    }
    return unsubscribe;
  }, [queryClient]);
}
