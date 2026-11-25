import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY } from '@istigaba/config';
import { I18nManager } from 'react-native';
import { useLanguageStore } from '../src/stores/language.store';
import { useThemeStore } from '../src/stores/theme.store';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('NFR-022 mobile theme store', () => {
  it('NFR-022 defaults to system and persists only the theme preference', async () => {
    expect(useThemeStore.getState().preference).toBe('system');

    useThemeStore.getState().setPreference('dark');
    await new Promise((r) => setTimeout(r, 0));

    expect(await AsyncStorage.getAllKeys()).toEqual([THEME_STORAGE_KEY]);
    const saved = JSON.parse((await AsyncStorage.getItem(THEME_STORAGE_KEY)) ?? '{}') as {
      state: object;
    };
    expect(saved.state).toEqual({ preference: 'dark' });
  });
});

describe('NFR-022 mobile language store', () => {
  it('NFR-022 switching language forces the matching layout direction and persists only the code', async () => {
    const forceRTL = jest.spyOn(I18nManager, 'forceRTL');

    useLanguageStore.getState().setLanguage('en');
    await new Promise((r) => setTimeout(r, 0));

    expect(forceRTL).toHaveBeenCalledWith(false);
    expect(await AsyncStorage.getAllKeys()).toEqual([LANGUAGE_STORAGE_KEY]);
    const saved = JSON.parse((await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)) ?? '{}') as {
      state: object;
    };
    expect(saved.state).toEqual({ language: 'en' });

    useLanguageStore.getState().setLanguage('ar');
    expect(forceRTL).toHaveBeenLastCalledWith(true);
  });
});
