import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compareSchemas, normalizeDbmlType, normalizeDefault, schemaFromDbml } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const expected = schemaFromDbml(readFileSync(join(root, 'docs', 'erd_v1.1.dbml'), 'utf8'));

/** A database that matches the DBML exactly, plus the allowlisted framework tables. */
function matchingDatabase() {
  const db = structuredClone(expected);
  db.tables.migrations = {
    columns: {},
    primaryKey: [],
    uniques: [],
    indexes: [],
    partialIndexes: [],
    foreignKeys: [],
  };
  return db;
}

describe('S0 schema-drift: DBML parsing', () => {
  it('S0 reads all 19 tables and 8 enums from erd_v1.1.dbml', () => {
    expect(Object.keys(expected.tables)).toHaveLength(19);
    expect(Object.keys(expected.enums)).toHaveLength(8);
    expect(expected.enums.mission_status).toEqual([
      'assigned',
      'en_route',
      'on_site',
      'mission_completed',
      'cancelled',
    ]);
  });

  it('S0 maps DBML column definitions to PostgreSQL types, nullability and defaults', () => {
    const users = expected.tables.users;
    expect(users.columns.id).toEqual({
      type: 'uuid',
      nullable: false,
      default: 'gen_random_uuid()',
    });
    expect(users.columns.email).toEqual({
      type: 'character varying(255)',
      nullable: false,
      default: null,
    });
    expect(users.columns.phone.nullable).toBe(true);
    expect(users.columns.last_known_location.type).toBe('geography(Point,4326)');
    expect(expected.tables.reports.columns.current_status).toEqual({
      type: 'report_status',
      nullable: false,
      default: "'received'",
    });
    expect(expected.tables.reports.columns.priority_score.type).toBe('numeric(6,2)');
    expect(expected.tables.roles.columns.id.default).toBe('@increment');
    expect(expected.tables.role_permissions.primaryKey).toEqual(['role_id', 'permission_id']);
  });

  it('S0 resolves foreign keys, including the one-to-one ai_extractions.report_id', () => {
    expect(expected.tables.ai_extractions.foreignKeys).toContainEqual({
      columns: ['report_id'],
      refTable: 'reports',
      refColumns: ['id'],
    });
    expect(expected.tables.users.foreignKeys).toContainEqual({
      columns: ['field_unit_id'],
      refTable: 'field_units',
      refColumns: ['id'],
    });
    expect(expected.tables.reports.foreignKeys).toHaveLength(3);
  });

  it('S0 expects the one-active-assignment partial unique index', () => {
    expect(expected.tables.assignments.partialIndexes).toEqual([
      {
        columns: ['report_id'],
        unique: true,
        predicate: "(mission_status <> 'cancelled'::mission_status)",
      },
    ]);
  });

  it('S0 normalises PostgreSQL defaults and types', () => {
    expect(normalizeDefault("nextval('roles_id_seq'::regclass)")).toBe('@increment');
    expect(normalizeDefault('CURRENT_TIMESTAMP')).toBe('now()');
    expect(normalizeDefault("'available'::unit_availability")).toBe("'available'");
    expect(normalizeDbmlType('varchar(30)')).toBe('character varying(30)');
  });
});

describe('S0 schema-drift: comparison', () => {
  it('S0 a matching database plus allowlisted framework tables has no drift', () => {
    expect(compareSchemas(expected, matchingDatabase())).toEqual([]);
  });

  it.each([
    [
      'a removed column',
      (db) => delete db.tables.users.columns.phone,
      'users.phone: missing column',
    ],
    [
      'an added column',
      (db) => (db.tables.users.columns.nickname = { type: 'text', nullable: true, default: null }),
      'users.nickname: unexpected column',
    ],
    [
      'a wrong nullability',
      (db) => (db.tables.reports.columns.description.nullable = false),
      'reports.description: expected NULL got NOT NULL',
    ],
    [
      'a wrong type',
      (db) => (db.tables.reports.columns.description.type = 'character varying(255)'),
      'reports.description: type expected text got character varying(255)',
    ],
    [
      'a changed enum order',
      (db) => db.enums.severity_level.reverse(),
      'enum severity_level: expected',
    ],
    ['an extra enum', (db) => (db.enums.mood = ['ok']), 'enum mood: unexpected'],
    [
      'an extra table',
      (db) => (db.tables.sessions = structuredClone(db.tables.migrations)),
      'table sessions: unexpected (not in DBML)',
    ],
    ['a missing table', (db) => delete db.tables.audit_logs, 'table audit_logs: missing'],
    [
      'a missing partial index',
      (db) => (db.tables.assignments.partialIndexes = []),
      'assignments partial index: missing',
    ],
    [
      'an extra index',
      (db) => db.tables.reports.indexes.push(['description']),
      'reports index: unexpected description',
    ],
    [
      'a missing foreign key',
      (db) => db.tables.users.foreignKeys.pop(),
      'users foreign key: missing',
    ],
    [
      'a wrong default',
      (db) => (db.tables.users.columns.is_active.default = 'false'),
      'users.is_active: default expected true got false',
    ],
  ])('S0 detects %s', (_label, mutate, message) => {
    const db = matchingDatabase();
    mutate(db);
    const diffs = compareSchemas(expected, db);
    expect(diffs.some((d) => d.startsWith(message))).toBe(true);
  });
});
