#!/usr/bin/env node
// Runs a tool from apps/ai-service/.venv on Windows (Scripts/) or POSIX (bin/).
// Usage: node scripts/ai.mjs <tool> [...args]   e.g. node scripts/ai.mjs pytest -q
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'ai-service');
const venv = join(root, '.venv');
const binDir = existsSync(join(venv, 'Scripts')) ? join(venv, 'Scripts') : join(venv, 'bin');
const [tool, ...args] = process.argv.slice(2);

if (!tool) {
  console.error('usage: node scripts/ai.mjs <tool> [...args]');
  process.exit(2);
}
if (!existsSync(binDir)) {
  console.error(
    'apps/ai-service/.venv is missing. Run: cd apps/ai-service && py -3.13 -m venv .venv',
  );
  process.exit(2);
}

const result = spawnSync(join(binDir, tool), args, { cwd: root, stdio: 'inherit', shell: false });
process.exit(result.status ?? 1);
