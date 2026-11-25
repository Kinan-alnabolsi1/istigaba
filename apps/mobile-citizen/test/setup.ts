// Jest setup: native modules are mocked; nothing touches a device.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  };
});

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'ar' }] }));

jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  reloadAppAsync: jest.fn(async () => {}),
}));
