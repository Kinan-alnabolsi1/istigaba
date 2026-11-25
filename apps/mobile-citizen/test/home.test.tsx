import { colorsFor } from '@istigaba/config';
import { resources } from '@istigaba/i18n';
import { ThemeProvider, useTokens } from '@istigaba/ui';
import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { HomePlaceholder } from '../src/components/HomePlaceholder';
import { AppProviders } from '../src/components/AppProviders';
import { useLanguageStore } from '../src/stores/language.store';

describe('NFR-022 mobile-citizen shell', () => {
  it('NFR-022 renders the citizen shell in Arabic by default and in English after switching', async () => {
    await render(
      <AppProviders>
        <HomePlaceholder />
      </AppProviders>,
    );
    expect(await screen.findByText(resources.ar.apps.citizen)).toBeTruthy();
    expect(screen.getByText(resources.ar.common.foundationReady)).toBeTruthy();

    await act(async () => useLanguageStore.getState().setLanguage('en'));
    expect(await screen.findByText(resources.en.apps.citizen)).toBeTruthy();
  });

  it('NFR-022 ThemeProvider exposes the dark tokens when dark is chosen', async () => {
    function Probe() {
      return <Text>{useTokens().background}</Text>;
    }
    await render(
      <ThemeProvider preference="dark" app="citizen" lang="ar">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText(colorsFor('dark').background)).toBeTruthy();
  });
});
