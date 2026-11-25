// The only place tokens are stored on the device (CLAUDE.md §9: expo-secure-store only).
import * as SecureStore from 'expo-secure-store';

export type SecureKey = 'refresh_token';

const PREFIX = 'istigaba.';
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStore = {
  get: (key: SecureKey): Promise<string | null> => SecureStore.getItemAsync(PREFIX + key, OPTIONS),
  set: (key: SecureKey, value: string): Promise<void> =>
    SecureStore.setItemAsync(PREFIX + key, value, OPTIONS),
  remove: (key: SecureKey): Promise<void> => SecureStore.deleteItemAsync(PREFIX + key, OPTIONS),
};
