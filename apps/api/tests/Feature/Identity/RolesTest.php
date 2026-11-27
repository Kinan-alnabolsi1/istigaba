<?php

use App\Modules\Identity\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

function roleId(string $name): int
{
    return (int) DB::table('roles')->where('name', $name)->value('id');
}

/** @param list<string> $codes @return list<int> */
function permissionIds(array $codes): array
{
    return DB::table('permissions')->whereIn('code', $codes)->orderBy('id')->pluck('id')->map(fn ($id) => (int) $id)->all();
}

it('FR-004 lists the four roles with their permissions', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);

    $data = $this->getJson('/api/v1/admin/roles', bearer($admin))
        ->assertOk()
        ->assertMatchesContract()
        ->json('data');

    expect(collect($data)->pluck('name')->all())->toEqualCanonicalizing(Role::ALL);
    $dispatcher = collect($data)->firstWhere('name', Role::DISPATCHER);
    expect(collect($dispatcher['permissions'])->pluck('code'))->toContain('report.assign')->toHaveCount(11);
})->group('FR-004');

it('FR-004 lists all permission codes', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);

    $data = $this->getJson('/api/v1/admin/permissions', bearer($admin))
        ->assertOk()
        ->assertMatchesContract()
        ->json('data');

    expect($data)->toHaveCount(20);
})->group('FR-004');

it('FR-004 NFR-007 other roles get 403 forbidden', function (string $role) {
    $user = userWithRole($role);

    foreach (['/api/v1/admin/roles', '/api/v1/admin/permissions'] as $url) {
        $this->getJson($url, bearer($user))->assertForbidden()->assertJson(['code' => 'forbidden'])->assertMatchesContract();
    }
    $this->putJson('/api/v1/admin/roles/'.roleId(Role::CITIZEN).'/permissions', ['permission_ids' => []], bearer($user))
        ->assertForbidden();
})->with([Role::CITIZEN, Role::DISPATCHER, Role::FIELD_UNIT_REPRESENTATIVE])->group('FR-004', 'NFR-007');

it('FR-004 NFR-007 an administrator without role.manage gets 403', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);
    DB::table('role_permissions')
        ->where('role_id', roleId(Role::SYSTEM_ADMINISTRATOR))
        ->where('permission_id', DB::table('permissions')->where('code', 'role.manage')->value('id'))
        ->delete();

    $this->getJson('/api/v1/admin/roles', bearer($admin))->assertForbidden();
})->group('FR-004', 'NFR-007');

it('FR-004 replaces a role permission set and returns the role', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);
    $ids = permissionIds(['report.view', 'chat.use']);

    $this->putJson('/api/v1/admin/roles/'.roleId(Role::DISPATCHER).'/permissions', ['permission_ids' => $ids], bearer($admin))
        ->assertOk()
        ->assertMatchesContract()
        ->assertJson(['name' => Role::DISPATCHER]);

    expect(DB::table('role_permissions')->where('role_id', roleId(Role::DISPATCHER))->orderBy('permission_id')->pluck('permission_id')->map(fn ($id) => (int) $id)->all())
        ->toBe($ids);
})->group('FR-004');

it('FR-004 a change takes effect on the next request', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);
    $headers = bearer($admin);
    $this->getJson('/api/v1/admin/roles', $headers)->assertOk();

    // The administrator removes role.manage from their own role.
    $this->putJson('/api/v1/admin/roles/'.roleId(Role::SYSTEM_ADMINISTRATOR).'/permissions', ['permission_ids' => permissionIds(['user.manage'])], $headers)
        ->assertOk();

    $this->getJson('/api/v1/admin/roles', $headers)->assertForbidden();
    $this->getJson('/api/v1/me', $headers)->assertOk()->assertJson(['permissions' => ['user.manage']]);
})->group('FR-004', 'NFR-007');

it('FR-004 an unknown role gives 404 and an unknown permission gives 422', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);

    $this->putJson('/api/v1/admin/roles/9999/permissions', ['permission_ids' => []], bearer($admin))
        ->assertNotFound()->assertJson(['code' => 'not_found'])->assertMatchesContract();

    $this->putJson('/api/v1/admin/roles/'.roleId(Role::CITIZEN).'/permissions', ['permission_ids' => [999999]], bearer($admin))
        ->assertUnprocessable()->assertJsonValidationErrors(['permission_ids.0'])->assertMatchesContract();

    $this->putJson('/api/v1/admin/roles/'.roleId(Role::CITIZEN).'/permissions', ['permission_ids' => [1, 1]], bearer($admin))
        ->assertUnprocessable();
})->group('FR-004');

it('NFR-010 FR-004 a replacement is audited with the old and new code lists', function () {
    $admin = userWithRole(Role::SYSTEM_ADMINISTRATOR);

    $this->putJson('/api/v1/admin/roles/'.roleId(Role::FIELD_UNIT_REPRESENTATIVE).'/permissions', ['permission_ids' => permissionIds(['mission.update'])], bearer($admin))
        ->assertOk();

    $row = DB::table('audit_logs')->where('action', 'role.permissions_replace')->first();
    expect($row)->not->toBeNull()
        ->and($row->actor_id)->toBe($admin->id)
        ->and($row->entity_type)->toBe('role')
        ->and($row->entity_id)->toBe((string) roleId(Role::FIELD_UNIT_REPRESENTATIVE))
        ->and(json_decode((string) $row->old_value, true))->toBe(['permissions' => ['assignment.view_own', 'field_unit.update_own', 'mission.update']])
        ->and(json_decode((string) $row->new_value, true))->toBe(['permissions' => ['mission.update']]);
})->group('NFR-010', 'FR-004');
