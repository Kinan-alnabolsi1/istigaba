<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

/** @return array<string, list<string>> enum name => ordered values, parsed from the DBML */
function s0DbmlEnums(): array
{
    $dbml = (string) file_get_contents(dirname(__DIR__, 4).'/docs/erd_v1.1.dbml');
    preg_match_all('/^Enum\s+(\w+)\s*\{(.*?)^\}/ms', $dbml, $m, PREG_SET_ORDER);

    $enums = [];
    foreach ($m as [, $name, $body]) {
        preg_match_all('/^\s*([a-z_]+)\b/m', $body, $values);
        $enums[$name] = $values[1];
    }

    return $enums;
}

/** @return list<string> tables whose `id` is `uuid [pk, default: gen_random_uuid()]` in the DBML */
function s0DbmlUuidTables(): array
{
    $dbml = (string) file_get_contents(dirname(__DIR__, 4).'/docs/erd_v1.1.dbml');
    preg_match_all('/^Table\s+(\w+)\s*\{\s*\n\s*id uuid \[pk, default: `gen_random_uuid\(\)`\]/m', $dbml, $m);

    return $m[1];
}

it('S0 PostGIS 3.7 is installed in the test database', function () {
    $version = DB::scalar('SELECT postgis_lib_version()');

    expect($version)->toStartWith('3.7');
})->group('S0');

it('S0 native enums match the DBML exactly, including value order', function () {
    $expected = s0DbmlEnums();
    expect($expected)->toHaveCount(8);

    foreach ($expected as $name => $values) {
        $actual = array_map(
            fn (object $r) => $r->enumlabel,
            DB::select(
                'SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = ? ORDER BY e.enumsortorder',
                [$name],
            ),
        );
        expect($actual)->toBe($values, "enum {$name}");
    }
})->group('S0');

it('S0 every DBML uuid primary key defaults to gen_random_uuid()', function () {
    $tables = s0DbmlUuidTables();
    expect($tables)->not->toBeEmpty();

    foreach ($tables as $table) {
        $default = DB::scalar(
            "SELECT column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = 'id'",
            [$table],
        );
        expect($default)->toBe('gen_random_uuid()', "{$table}.id");
    }
})->group('S0');

it('S0 one active assignment per report is enforced by the partial unique index', function () {
    $roleId = DB::table('roles')->insertGetId(['name' => 'Dispatcher']);
    $unitA = DB::table('field_units')->insertGetId(['name' => 'Unit A', 'unit_type' => 'إسعاف']);
    $unitB = DB::table('field_units')->insertGetId(['name' => 'Unit B', 'unit_type' => 'إسعاف']);
    $userId = (string) DB::scalar(
        "INSERT INTO users (role_id, full_name, email, password_hash) VALUES (?, 'D', 'd@istigaba.example', 'x') RETURNING id",
        [$roleId],
    );
    $typeId = DB::table('report_types')->insertGetId(['category' => 'c', 'name' => 'n', 'responsible_authority' => 'a']);
    $reportId = (string) DB::scalar(
        "INSERT INTO reports (reporter_id, report_type_id, source) VALUES (?, ?, 'manual') RETURNING id",
        [$userId, $typeId],
    );
    $assign = fn (int $unit, string $status = 'assigned') => DB::insert(
        'INSERT INTO assignments (report_id, field_unit_id, assigned_by, mission_status) VALUES (?, ?, ?, ?::mission_status)',
        [$reportId, $unit, $userId, $status],
    );

    $assign($unitA, 'cancelled');
    $assign($unitB);                     // one cancelled + one active: allowed
    expect(fn () => $assign($unitA))     // a second active one: rejected
        ->toThrow(QueryException::class, 'assignments_one_active_per_report');
})->group('S0');
