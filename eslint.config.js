// One flat ESLint config for every JS/TS workspace (CLAUDE.md §9, apps/*/CLAUDE.md "Boundaries").
// Rules are proven by tooling/eslint-boundaries.test.mjs against tooling/eslint-fixtures.
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

const APPS = ['web-ops', 'web-admin', 'mobile-citizen', 'mobile-field', 'api', 'ai-service'];

/** Physical direction utilities; use logical ones instead (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start). */
const PHYSICAL_DIRECTION =
  '(^|\\s)(-?m[lr]|p[lr]|-?left|-?right|rounded-[lr]|rounded-[tb][lr]|border-[lr]|text-left|text-right|float-left|float-right)(-|\\s|$)';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.expo/**',
      'apps/api/**',
      'apps/ai-service/**',
      'packages/api-types/src/openapi.d.ts',
      'packages/config/css/**',
      '**/expo-env.d.ts',
      '**/nativewind-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Node-run config/scripts (CommonJS or ESM) outside the app sources.
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        structuredClone: 'readonly',
      },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },

  // TypeScript everywhere.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': 'error',
    },
  },

  // App sources: architecture boundaries (feature index.ts only, no cross-app imports).
  {
    files: [
      'apps/*/src/**/*.{ts,tsx}',
      'apps/*/app/**/*.{ts,tsx}',
      'tooling/eslint-fixtures/**/*.{ts,tsx}',
    ],
    plugins: { boundaries },
    settings: {
      'import/resolver': { node: { extensions: ['.ts', '.tsx', '.js', '.mjs'] } },
      'boundaries/elements': [
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'src/(app|stores|components|lib|services|i18n|styles)' },
        { type: 'route', pattern: 'app' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: ['feature', 'shared', 'route'] } },
              disallow: { to: { element: { type: 'feature' } } },
              message:
                'Import another feature only through its index.ts (its only public surface).',
            },
            {
              from: { element: { type: ['feature', 'shared', 'route'] } },
              allow: {
                to: { element: { type: 'feature', fileInternalPath: ['index.ts', 'index.tsx'] } },
              },
            },
            {
              // Files of a feature may import each other freely.
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: {
                    type: 'feature',
                    captured: { feature: '{{ from.element.captured.feature }}' },
                  },
                },
              },
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'Use @istigaba/api-client (CLAUDE.md §9): no ad-hoc Axios.' },
          ],
          patterns: [
            {
              regex: `^(\\.\\./)+(apps/)?(${APPS.join('|')})/`,
              message: 'Never import from another app; move shared code to packages/*.',
            },
            {
              group: ['**/apps/**'],
              message: 'Never import from another app; move shared code to packages/*.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use @istigaba/api-client (CLAUDE.md §9).' },
        {
          name: 'localStorage',
          message: 'Only theme/language preferences may be persisted (CLAUDE.md §9).',
        },
        {
          name: 'sessionStorage',
          message: 'Only src/lib/api.ts may keep the web refresh token (S1).',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=/${PHYSICAL_DIRECTION}/]`,
          message:
            'Use logical utilities (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start): RTL is the default.',
        },
        {
          selector: `TemplateElement[value.raw=/${PHYSICAL_DIRECTION}/]`,
          message:
            'Use logical utilities (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start): RTL is the default.',
        },
      ],
    },
  },

  // Persistence exceptions: only the preference stores (and the web-ui storage helper).
  {
    files: [
      'apps/*/src/stores/theme.store.ts',
      'apps/*/src/stores/language.store.ts',
      'tooling/eslint-fixtures/**/stores/theme.store.ts',
    ],
    rules: {
      'no-restricted-globals': ['error', { name: 'fetch', message: 'Use @istigaba/api-client.' }],
    },
  },
  {
    files: ['apps/web-*/src/lib/api.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use @istigaba/api-client.' },
        { name: 'localStorage', message: 'Tokens never go to localStorage (CLAUDE.md §9).' },
      ],
    },
  },

  // src/i18n holds initialisation only: no translation strings (they live in packages/i18n).
  {
    files: ['apps/*/src/i18n/**/*.{ts,tsx}', 'tooling/eslint-fixtures/**/i18n/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/[\\u0600-\\u06FF]/], Literal[value=/\\s\\S+\\s/]',
          message:
            'Translation strings live only in packages/i18n; src/i18n is initialisation only.',
        },
      ],
    },
  },

  // Mobile: device storage and OS APIs only through their owners (apps/mobile-*/CLAUDE.md).
  {
    files: ['apps/mobile-*/src/**/*.{ts,tsx}', 'apps/mobile-*/app/**/*.{ts,tsx}'],
    ignores: [
      'apps/mobile-*/src/stores/*.store.ts',
      'apps/mobile-*/src/services/**',
      'apps/mobile-*/src/i18n/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'Use @istigaba/api-client (CLAUDE.md §9).' },
            {
              name: '@react-native-async-storage/async-storage',
              message: 'AsyncStorage only in src/stores (theme/language).',
            },
            { name: 'expo-secure-store', message: 'Use src/services/secure-store.ts.' },
          ],
          patterns: [{ group: ['**/apps/**'], message: 'Never import from another app.' }],
        },
      ],
    },
  },

  // Tests may use any test helpers.
  {
    files: ['**/test/**/*.{ts,tsx}', '**/*.test.{ts,tsx,mjs}'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
      // jest.mock factories must require() lazily.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
