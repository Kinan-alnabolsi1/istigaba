<?php

use Database\Seeders\FirstAdminSeeder;
use Database\Seeders\IdentitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\Contract\Concerns\ContractValidator;

uses(RefreshDatabase::class);

/** @return array<string, list<string>> role => sorted codes required by the contract */
function contractRolePermissions(): array
{
    $map = [];
    foreach (ContractValidator::document()['paths'] as $operations) {
        foreach ($operations as $operation) {
            if (! is_array($operation)) {
                continue;
            }
            foreach ($operation['x-required-permissions'] ?? [] as $code) {
                foreach ($operation['x-required-roles'] ?? [] as $role) {
                    $map[$role][] = $code;
                }
            }
        }
    }

    return array_map(fn (array $codes) => array_values(array_unique($codes)), $map);
}

/** @return array<string, list<string>> */
function seededRolePermissions(): array
{
    $rows = DB::table('role_permissions')
        ->join('roles', 'roles.id', '=', 'role_permissions.role_id')
        ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
        ->get(['roles.name', 'permissions.code']);

    $map = [];
    foreach ($rows as $row) {
        $map[$row->name][] = $row->code;
    }

    return $map;
}

it('FR-004 seeds exactly the four SRS roles', function () {
    seedIdentity();

    expect(DB::table('roles')->orderBy('name')->pluck('name')->all())
        ->toBe(['Citizen', 'Dispatcher', 'Field Unit Representative', 'System Administrator']);
})->group('FR-004', 'NFR-007');

it('FR-004 seeds exactly the 20 D-34 permission codes, equal to every x-required-permissions code', function () {
    seedIdentity();

    $contract = collect(contractRolePermissions())->flatten()->unique()->sort()->values()->all();
    $seeded = DB::table('permissions')->orderBy('code')->pluck('code')->all();

    expect($seeded)->toHaveCount(20)
        ->and($seeded)->toBe($contract)
        ->and($seeded)->toBe(collect(array_keys(IdentitySeeder::PERMISSIONS))->sort()->values()->all());
})->group('FR-004', 'NFR-007');

it('FR-004 the seeded role map equals the contract role/permission pairs', function () {
    seedIdentity();

    $contract = contractRolePermissions();
    $seeded = seededRolePermissions();

    foreach (['Dispatcher', 'Field Unit Representative', 'System Administrator'] as $role) {
        expect(collect($seeded[$role] ?? [])->sort()->values()->all())
            ->toBe(collect($contract[$role])->sort()->values()->all());
    }
    expect($seeded)->not->toHaveKey('Citizen');
})->group('FR-004', 'NFR-007');

it('FR-004 re-seeding is idempotent and keeps admin edits to the role map', function () {
    seedIdentity();
    $dispatcher = DB::table('roles')->where('name', 'Dispatcher')->value('id');
    $chat = DB::table('permissions')->where('code', 'chat.use')->value('id');
    DB::table('role_permissions')->where(['role_id' => $dispatcher, 'permission_id' => $chat])->delete();

    seedIdentity();

    expect(DB::table('roles')->count())->toBe(4)
        ->and(DB::table('permissions')->count())->toBe(20)
        // The pair removed by the administrator stays removed; nothing is duplicated.
        ->and(DB::table('role_permissions')->count())->toBe(20)
        ->and(DB::table('role_permissions')->where(['role_id' => $dispatcher, 'permission_id' => $chat])->exists())->toBeFalse();
})->group('FR-004');

describe('first admin', function () {
    beforeEach(function () {
        seedIdentity();
        config([
            'istigaba.first_admin.email' => 'Admin@Example.com',
            'istigaba.first_admin.password' => 'a-strong-password',
            'istigaba.first_admin.phone' => '+963933000001',
        ]);
    });

    it('FR-004 creates the first System Administrator from config with an Argon2id hash', function () {
        $this->seed(FirstAdminSeeder::class);

        $admin = DB::table('users')->where('email', 'admin@example.com')->first();
        expect($admin)->not->toBeNull()
            ->and(DB::table('roles')->where('id', $admin->role_id)->value('name'))->toBe('System Administrator')
            ->and(str_starts_with($admin->password_hash, '$argon2id$'))->toBeTrue()
            ->and(Hash::check('a-strong-password', $admin->password_hash))->toBeTrue();
    })->group('FR-004', 'NFR-006');

    it('FR-004 is idempotent and never overwrites an existing admin password', function () {
        $this->seed(FirstAdminSeeder::class);
        config(['istigaba.first_admin.password' => 'another-password']);
        $this->seed(FirstAdminSeeder::class);

        $hash = DB::table('users')->where('email', 'admin@example.com')->value('password_hash');
        expect(DB::table('users')->count())->toBe(1)
            ->and(Hash::check('a-strong-password', $hash))->toBeTrue();
    })->group('FR-004');

    it('FR-004 refuses to run without an email or password', function (string $key) {
        config(["istigaba.first_admin.{$key}" => null]);

        expect(fn () => $this->seed(FirstAdminSeeder::class))->toThrow(RuntimeException::class);
        expect(DB::table('users')->count())->toBe(0);
    })->with(['email', 'password'])->group('FR-004');

    it('FR-004 refuses the example or a short password in production', function (string $password) {
        config(['istigaba.first_admin.password' => $password]);
        app()->detectEnvironment(fn () => 'production');

        expect(fn () => (new FirstAdminSeeder)->run())->toThrow(RuntimeException::class);
        expect(DB::table('users')->count())->toBe(0);
    })->with(['change-me-admin', 'short'])->group('FR-004', 'NFR-006');
});
