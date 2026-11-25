// Zustand: theme preference only (system | light | dark), persisted as `istigaba-theme`.
import { createThemeStore } from '@istigaba/web-ui/theme';

export const useThemeStore = createThemeStore();
