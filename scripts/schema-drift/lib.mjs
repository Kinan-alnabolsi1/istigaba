// Schema-drift core: normalises the DBML and a live PostgreSQL catalog into one shape and diffs them.
// No I/O here, so the comparison is unit-tested on fixtures (lib.test.mjs).
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * @typedef {{ type: string, nullable: boolean, default: string | null }} Column
 * @typedef {{ columns: string[], unique: boolean, predicate?: string | null }} Index
 * @typedef {{ columns: string[], refTable: string, refColumns: string[] }} ForeignKey
 * @typedef {{ columns: Record<string, Column>, primaryKey: string[], uniques: string[][], indexes: string[][], partialIndexes: Index[], foreignKeys: ForeignKey[] }} Table
 * @typedef {{ enums: Record<string, string[]>, tables: Record<string, Table> }} Schema
 */

/** Framework tables allowed outside the DBML (owner decision B2). */
export const ALLOWED_EXTRA_TABLES = ['migrations', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs'];

/** Physical-schema objects the DBML cannot express but the ERD explanation requires. */
export const EXPECTED_PARTIAL_INDEXES = {
  assignments: [
    { columns: ['report_id'], unique: true, predicate: "(mission_status <> 'cancelled'::mission_status)" },
  ],
};

const DBML_TYPES = {
  int: 'integer',
  integer: 'integer',
  bigint: 'bigint',
  uuid: 'uuid',
  text: 'text',
  boolean: 'boolean',
  timestamptz: 'timestamp with time zone',
  jsonb: 'jsonb',
  inet: 'inet',
};

/** DBML type name → the string PostgreSQL's format_type() prints. */
export function normalizeDbmlType(typeName) {
  const t = typeName.trim();
  const varchar = /^varchar\((\d+)\)$/i.exec(t);
  if (varchar) return `character varying(${varchar[1]})`;
  if (/^numeric\(\d+,\d+\)$/i.test(t)) return t.toLowerCase();
  const geo = /^geography\((\w+),(\d+)\)$/i.exec(t);
  if (geo) return `geography(${geo[1][0].toUpperCase()}${geo[1].slice(1).toLowerCase()},${geo[2]})`;
  return DBML_TYPES[t.toLowerCase()] ?? t; // enum names pass through
}

/** Defaults from either side → one comparable token. */
export function normalizeDefault(raw) {
  if (raw === null || raw === undefined) return null;
  const v = String(raw).trim();
  if (/^nextval\(/i.test(v) || v === '@increment') return '@increment';
  if (/^(now\(\)|current_timestamp)$/i.test(v)) return 'now()';
  const cast = /^'(.*)'::[\w ."]+$/.exec(v); // 'received'::report_status
  if (cast) return `'${cast[1]}'`;
  return v.toLowerCase() === 'true' || v.toLowerCase() === 'false' ? v.toLowerCase() : v;
}

/** @returns {Schema} */
export function schemaFromDbml(text) {
  const { Parser } = require('@dbml/core');
  const db = Parser.parse(text, 'dbmlv2');
  const s = db.schemas[0];
  /** @type {Schema} */
  const out = { enums: {}, tables: {} };

  for (const e of s.enums) out.enums[e.name] = e.values.map((v) => v.name);

  for (const t of s.tables) {
    /** @type {Table} */
    const table = { columns: {}, primaryKey: [], uniques: [], indexes: [], partialIndexes: [], foreignKeys: [] };
    for (const f of t.fields) {
      const def = f.increment
        ? '@increment'
        : f.dbdefault
          ? normalizeDefault(f.dbdefault.type === 'string' ? `'${f.dbdefault.value}'` : f.dbdefault.value)
          : null;
      table.columns[f.name] = {
        type: normalizeDbmlType(f.type.type_name),
        nullable: !(f.not_null || f.pk),
        default: def,
      };
      if (f.pk) table.primaryKey.push(f.name);
      if (f.unique) table.uniques.push([f.name]);
    }
    for (const i of t.indexes) {
      const cols = i.columns.map((c) => c.value);
      if (i.pk) table.primaryKey = cols;
      else if (i.unique) table.uniques.push(cols);
      else table.indexes.push(cols);
    }
    table.partialIndexes = EXPECTED_PARTIAL_INDEXES[t.name] ?? [];
    out.tables[t.name] = table;
  }

  for (const r of s.refs) {
    const isPk = (e) => {
      const tbl = out.tables[e.tableName];
      return e.fieldNames.every((f) => tbl?.primaryKey.includes(f));
    };
    // FK side: the "many" end; for one-to-one, the end whose columns are not its table's primary key.
    const fkEnd = r.endpoints.find((e) => e.relation === '*') ?? r.endpoints.find((e) => !isPk(e));
    const refEnd = r.endpoints.find((e) => e !== fkEnd);
    if (!fkEnd || !refEnd) throw new Error(`cannot resolve ref ${JSON.stringify(r.endpoints)}`);
    out.tables[fkEnd.tableName].foreignKeys.push({
      columns: [...fkEnd.fieldNames],
      refTable: refEnd.tableName,
      refColumns: [...refEnd.fieldNames],
    });
  }
  return out;
}

const key = (cols) => cols.join(',');
const sortedKeys = (list) => list.map(key).sort();
const fkKey = (fk) => `${key(fk.columns)} -> ${fk.refTable}(${key(fk.refColumns)})`;
const idxKey = (i) => `${i.unique ? 'unique ' : ''}(${key(i.columns)}) WHERE ${i.predicate}`;

function diffSets(label, expected, actual, out) {
  const e = new Set(expected);
  const a = new Set(actual);
  for (const x of e) if (!a.has(x)) out.push(`${label}: missing ${x}`);
  for (const x of a) if (!e.has(x)) out.push(`${label}: unexpected ${x}`);
}

/**
 * @param {Schema} expected from the DBML
 * @param {Schema} actual from the database
 * @param {{ allowedExtraTables?: string[] }} [options]
 * @returns {string[]} human-readable differences (empty = no drift)
 */
export function compareSchemas(expected, actual, options = {}) {
  const allowed = new Set(options.allowedExtraTables ?? ALLOWED_EXTRA_TABLES);
  const out = [];

  for (const [name, values] of Object.entries(expected.enums)) {
    const got = actual.enums[name];
    if (!got) out.push(`enum ${name}: missing`);
    else if (key(got) !== key(values)) out.push(`enum ${name}: expected [${values}] got [${got}]`);
  }
  for (const name of Object.keys(actual.enums)) {
    if (!expected.enums[name]) out.push(`enum ${name}: unexpected`);
  }

  for (const name of Object.keys(actual.tables)) {
    if (!expected.tables[name] && !allowed.has(name)) out.push(`table ${name}: unexpected (not in DBML)`);
  }

  for (const [name, exp] of Object.entries(expected.tables)) {
    const act = actual.tables[name];
    if (!act) {
      out.push(`table ${name}: missing`);
      continue;
    }
    for (const [col, ec] of Object.entries(exp.columns)) {
      const ac = act.columns[col];
      if (!ac) {
        out.push(`${name}.${col}: missing column`);
        continue;
      }
      if (ec.type !== ac.type) out.push(`${name}.${col}: type expected ${ec.type} got ${ac.type}`);
      if (ec.nullable !== ac.nullable)
        out.push(`${name}.${col}: expected ${ec.nullable ? 'NULL' : 'NOT NULL'} got ${ac.nullable ? 'NULL' : 'NOT NULL'}`);
      if (ec.default !== ac.default) out.push(`${name}.${col}: default expected ${ec.default} got ${ac.default}`);
    }
    for (const col of Object.keys(act.columns)) {
      if (!exp.columns[col]) out.push(`${name}.${col}: unexpected column`);
    }
    if (key(exp.primaryKey) !== key(act.primaryKey))
      out.push(`${name}: primary key expected (${key(exp.primaryKey)}) got (${key(act.primaryKey)})`);
    diffSets(`${name} unique`, sortedKeys(exp.uniques), sortedKeys(act.uniques), out);
    diffSets(`${name} index`, sortedKeys(exp.indexes), sortedKeys(act.indexes), out);
    diffSets(`${name} partial index`, exp.partialIndexes.map(idxKey), act.partialIndexes.map(idxKey), out);
    diffSets(`${name} foreign key`, exp.foreignKeys.map(fkKey), act.foreignKeys.map(fkKey), out);
  }
  return out;
}

/** Reads the public schema of a connected `pg` client into the same shape (extension-owned objects excluded). */
export async function schemaFromDatabase(client) {
  const q = async (sql) => (await client.query(sql)).rows;
  /** @type {Schema} */
  const out = { enums: {}, tables: {} };
  const notExtension = (oidExpr, catalog) =>
    `NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = ${oidExpr} AND d.classid = '${catalog}'::regclass AND d.deptype = 'e')`;

  for (const r of await q(`
      SELECT t.typname AS name, array_agg(e.enumlabel ORDER BY e.enumsortorder)::text[] AS values
        FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid JOIN pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = 'public' AND ${notExtension('t.oid', 'pg_type')}
       GROUP BY t.typname`)) {
    out.enums[r.name] = r.values;
  }

  const tables = await q(`
      SELECT c.oid, c.relname AS name FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND ${notExtension('c.oid', 'pg_class')}`);

  for (const t of tables) {
    /** @type {Table} */
    const table = { columns: {}, primaryKey: [], uniques: [], indexes: [], partialIndexes: [], foreignKeys: [] };
    for (const c of await q(`
        SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type, NOT a.attnotnull AS nullable,
               pg_get_expr(ad.adbin, ad.adrelid) AS def, a.attidentity AS identity
          FROM pg_attribute a LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
         WHERE a.attrelid = ${t.oid} AND a.attnum > 0 AND NOT a.attisdropped`)) {
      table.columns[c.name] = {
        type: c.type,
        nullable: c.nullable,
        default: c.identity ? '@increment' : normalizeDefault(c.def),
      };
    }
    for (const i of await q(`
        SELECT i.indisprimary AS pk, i.indisunique AS uq, pg_get_expr(i.indpred, i.indrelid) AS predicate,
               array(SELECT a.attname FROM unnest(i.indkey) WITH ORDINALITY k(attnum, ord)
                       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum ORDER BY k.ord)::text[] AS cols
          FROM pg_index i WHERE i.indrelid = ${t.oid}`)) {
      if (i.predicate) table.partialIndexes.push({ columns: i.cols, unique: i.uq, predicate: i.predicate });
      else if (i.pk) table.primaryKey = i.cols;
      else if (i.uq) table.uniques.push(i.cols);
      else table.indexes.push(i.cols);
    }
    for (const f of await q(`
        SELECT rt.relname AS ref_table,
               array(SELECT a.attname FROM unnest(con.conkey) WITH ORDINALITY k(attnum, ord)
                       JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum ORDER BY k.ord)::text[] AS cols,
               array(SELECT a.attname FROM unnest(con.confkey) WITH ORDINALITY k(attnum, ord)
                       JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.attnum ORDER BY k.ord)::text[] AS ref_cols
          FROM pg_constraint con JOIN pg_class rt ON rt.oid = con.confrelid
         WHERE con.conrelid = ${t.oid} AND con.contype = 'f'`)) {
      table.foreignKeys.push({ columns: f.cols, refTable: f.ref_table, refColumns: f.ref_cols });
    }
    out.tables[t.name] = table;
  }
  return out;
}
