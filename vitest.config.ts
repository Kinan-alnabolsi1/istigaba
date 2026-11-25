// Root Vitest project: tests for repo scripts (schema drift, traceability) and the ESLint boundary fixtures.
// Workspace packages run their own Vitest/Jest through `pnpm -r test`.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/**/*.test.mjs', 'tooling/**/*.test.mjs'],
    environment: 'node',
  },
});
