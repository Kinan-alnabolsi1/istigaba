// Generates the committed theme files from src/tokens.ts (DESIGN_TOKENS.md §9.3, §9.5).
// Run: pnpm --filter @istigaba/config build:css   (CI fails if the output differs from git)
//
// Outputs:
//   css/theme.web.css            Tailwind CSS 4 + shadcn/ui (web-ops, web-admin)
//   css/tailwind-tokens.json     data for tailwind-preset.js (NativeWind v4 + Tailwind 3, decision B4)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTailwindTokens, buildWebCss } from '../src/generate';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'css');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'theme.web.css'), buildWebCss());
writeFileSync(
  join(outDir, 'tailwind-tokens.json'),
  `${JSON.stringify(buildTailwindTokens(), null, 2)}\n`,
);
