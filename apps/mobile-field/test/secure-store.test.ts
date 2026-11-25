import * as SecureStore from 'expo-secure-store';
import { secureStore } from '../src/services/secure-store';

describe('S0 secure-store service', () => {
  it('S0 stores tokens only in expo-secure-store, device-bound, under a namespaced key', async () => {
    await secureStore.set('refresh_token', 'r-1');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('istigaba.refresh_token', 'r-1', {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    expect(await secureStore.get('refresh_token')).toBe('r-1');

    await secureStore.remove('refresh_token');
    expect(await secureStore.get('refresh_token')).toBeNull();
  });
});
