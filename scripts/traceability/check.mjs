#!/usr/bin/env node
// Traceability check (CLAUDE.md §3.1): every FR/NFR declared implemented in
// docs/traceability/implemented.json has at least one test naming it, and no test or manifest
// entry names an ID that is not in docs/srs.md. Prints the ID → test files matrix.
// Usage: pnpm traceability
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate, idsInSrs, idsInTest } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// 'traceability' is skipped: its own tests contain deliberately fake IDs.
const SKIP = new Set([
  'node_modules',
  'vendor',
  '.venv',
  'dist',
  '.expo',
  'eslint-fixtures',
  'traceability',
]);
const TEST_ROOTS = ['apps', 'packages', 'scripts', 'tooling'];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const isTestFile = (path) => {
  const rel = relative(root, path).replaceAll('\\', '/');
  return (
    /\/tests\/.*\.php$/.test(rel) || // Pest
    /\/tests\/test_[^/]*\.py$/.test(rel) || // pytest
    /\/test\/.*\.(ts|tsx)$/.test(rel) || // Vitest / Jest
    /\.test\.(ts|tsx|mjs)$/.test(rel)
  );
};

const universe = idsInSrs(readFileSync(join(root, 'docs', 'srs.md'), 'utf8'));
const manifest = JSON.parse(
  readFileSync(join(root, 'docs', 'traceability', 'implemented.json'), 'utf8'),
);
const implemented = Object.values(manifest.slices).flat();

const tests = [];
for (const top of TEST_ROOTS) {
  for (const path of walk(join(root, top))) {
    if (!isTestFile(path)) continue;
    const ids = idsInTest(readFileSync(path, 'utf8'));
    if (ids.length) tests.push({ file: relative(root, path).replaceAll('\\', '/'), ids });
  }
}

const { errors, matrix } = evaluate({ universe, implemented, tests });

console.log(
  `Traceability: ${universe.size} IDs in docs/srs.md, ${implemented.length} declared implemented.`,
);
for (const id of [...matrix.keys()].sort()) {
  const files = matrix.get(id);
  console.log(`  ${id.padEnd(8)} ${files.length} file(s): ${files.join(', ')}`);
}
if (errors.length) {
  console.error('Traceability check failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exitCode = 1;
}
