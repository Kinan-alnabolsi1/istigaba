// S0: proves the ESLint architecture rules (root eslint.config.js) fire on known violations and
// stay quiet on clean code. Fixtures live in tooling/eslint-fixtures (mirrors an app's layout).
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = 'tooling/eslint-fixtures/apps/web-ops/src';
let eslint;

beforeAll(() => {
  eslint = new ESLint({ cwd: root });
});

async function ruleIds(relativePath) {
  const [result] = await eslint.lintFiles([join(root, fixtures, relativePath)]);
  return result.messages.map((m) => m.ruleId ?? `fatal: ${m.message}`);
}

describe('S0 ESLint boundary and frontend rules', () => {
  it.each([
    ['features/chat/deep-import.ts', 'boundaries/dependencies', 'deep import into another feature'],
    ['lib/cross-app.ts', 'no-restricted-imports', 'import from another app'],
    ['lib/raw-axios.ts', 'no-restricted-imports', 'axios outside packages/api-client'],
    ['lib/raw-fetch.ts', 'no-restricted-globals', 'fetch instead of the api-client'],
    [
      'lib/local-storage.ts',
      'no-restricted-globals',
      'localStorage outside the theme/language stores',
    ],
    ['i18n/init.ts', 'no-restricted-syntax', 'translation strings in src/i18n'],
    ['lib/physical-direction.ts', 'no-restricted-syntax', 'physical direction utility class'],
    ['lib/any-and-ignore.ts', '@typescript-eslint/no-explicit-any', 'explicit any'],
    ['lib/any-and-ignore.ts', '@typescript-eslint/ban-ts-comment', '@ts-ignore'],
  ])('S0 %s is reported (%s: %s)', async (file, rule) => {
    expect(await ruleIds(file)).toContain(rule);
  });

  it.each([
    'features/chat/entry-import.ts',
    'features/chat/index.ts',
    'features/reports/index.ts',
    'stores/theme.store.ts',
    'lib/clean.ts',
  ])('S0 %s is clean', async (file) => {
    expect(await ruleIds(file)).toEqual([]);
  });
});

describe('NFR-006 ESLint token storage rules (S1)', () => {
  async function packageRuleIds(relativePath) {
    const [result] = await eslint.lintFiles([
      join(root, 'tooling/eslint-fixtures/packages/web-ui/src', relativePath),
    ]);
    return result.messages.map((m) => m.ruleId ?? `fatal: ${m.message}`);
  }

  it('NFR-006 an app touching sessionStorage is reported, even in src/lib/api.ts', async () => {
    expect(await ruleIds('lib/api.ts')).toContain('no-restricted-globals');
  });

  it('NFR-006 web-ui code outside auth/token-storage.ts touching sessionStorage is reported', async () => {
    expect(await packageRuleIds('auth/leak.ts')).toContain('no-restricted-properties');
  });

  it('NFR-006 web-ui auth/token-storage.ts may keep the refresh token', async () => {
    expect(await packageRuleIds('auth/token-storage.ts')).toEqual([]);
  });
});
