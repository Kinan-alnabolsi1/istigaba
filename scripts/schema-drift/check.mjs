#!/usr/bin/env node
// Schema-drift check (CLAUDE.md §3.4): compares the migrated database with docs/erd_v1.1.dbml.
// Usage: pnpm schema:drift   (after `php artisan migrate` on the test database)
//
// Connection: PG* environment variables if set (CI), otherwise apps/api/.env
// (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_TEST_DATABASE). Never prints credentials.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { compareSchemas, schemaFromDatabase, schemaFromDbml } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function readEnv(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((l) => /^([A-Z0-9_]+)=(.*)$/.exec(l))
      .filter(Boolean)
      .map(([, k, v]) => [k, v.replace(/^"(.*)"$/, '$1')]),
  );
}

const env = readEnv(join(root, 'apps', 'api', '.env'));
const config = {
  host: process.env.PGHOST ?? env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? env.DB_PORT ?? 5432),
  user: process.env.PGUSER ?? env.DB_USERNAME ?? 'istigaba',
  password: process.env.PGPASSWORD ?? env.DB_PASSWORD,
  database: process.env.PGDATABASE ?? env.DB_TEST_DATABASE ?? 'istigaba_test',
};

const expected = schemaFromDbml(readFileSync(join(root, 'docs', 'erd_v1.1.dbml'), 'utf8'));
const client = new pg.Client(config);

try {
  await client.connect();
  const actual = await schemaFromDatabase(client);
  const diffs = compareSchemas(expected, actual);
  if (diffs.length > 0) {
    console.error(`Schema drift in database "${config.database}" vs docs/erd_v1.1.dbml:`);
    for (const d of diffs) console.error(`  - ${d}`);
    process.exitCode = 1;
  } else {
    const n = Object.keys(expected.tables).length;
    console.log(`No schema drift: ${n} tables and ${Object.keys(expected.enums).length} enums match docs/erd_v1.1.dbml.`);
  }
} catch (error) {
  console.error(`Schema drift check could not run: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
} finally {
  await client.end().catch(() => {});
}
