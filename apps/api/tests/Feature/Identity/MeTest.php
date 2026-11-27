<?php

use App\Modules\Identity\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use MatanYadaev\EloquentSpatial\Objects\Point;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

it('FR-002 FR-004 returns the caller with role and role permission codes', function (string $role, array $codes) {
    $user = userWithRole($role);

    $response = $this->getJson('/api/v1/me', bearer($user))
        ->assertOk()
        ->assertMatchesContract()
        ->assertJson(['id' => $user->id, 'email' => $user->email, 'role' => $role, 'is_active' => true]);

    expect($response->json('permissions'))->toBe($codes);
})->with([
    [Role::CITIZEN, []],
    [Role::FIELD_UNIT_REPRESENTATIVE, ['assignment.view_own', 'field_unit.update_own', 'mission.update']],
    [Role::SYSTEM_ADMINISTRATOR, ['audit.view', 'field_unit.manage', 'field_unit.view', 'identity.reveal', 'role.manage', 'settings.manage', 'user.manage']],
])->group('FR-002', 'FR-004');

it('FR-004 a field unit representative sees their unit', function () {
    $user = userWithRole(Role::FIELD_UNIT_REPRESENTATIVE);
    $unit = DB::table('field_units')->where('id', $user->field_unit_id)->first();

    $this->getJson('/api/v1/me', bearer($user))
        ->assertOk()
        ->assertJson(['field_unit' => ['id' => $unit->id, 'name' => $unit->name, 'unit_type' => $unit->unit_type]]);
})->group('FR-004');

it('NFR-012 never returns a password hash, token or precise location', function () {
    $user = userWithRole(Role::CITIZEN, ['location_consent' => true]);
    $user->forceFill(['last_known_location' => new Point(33.5138, 36.2765, 4326), 'location_updated_at' => now()])->save();

    $body = $this->getJson('/api/v1/me', bearer($user))->assertOk()->json();

    expect(array_keys($body))->toEqualCanonicalizing([
        'id', 'full_name', 'email', 'phone', 'role', 'field_unit', 'permissions', 'is_active',
        'location_consent', 'location_updated_at',
    ]);
    expect(json_encode($body))->not->toContain('33.5138')->not->toContain('argon2id');
})->group('NFR-012', 'NFR-016');

it('FR-002 requires a valid token', function (?string $header) {
    $this->getJson('/api/v1/me', $header === null ? [] : ['Authorization' => $header])
        ->assertUnauthorized()
        ->assertJson(['code' => 'unauthenticated'])
        ->assertMatchesContract();
})->with([null, 'Bearer not.a.jwt', 'Basic abc'])->group('FR-002', 'NFR-006');

it('NFR-006 an expired access token is rejected after 15 minutes', function () {
    $user = userWithRole(Role::CITIZEN);
    $headers = bearer($user);

    $this->travel(16)->minutes();

    $this->getJson('/api/v1/me', $headers)->assertUnauthorized();
})->group('NFR-006');

it('NFR-006 a deactivated user is rejected with 401 on the next request', function () {
    $user = userWithRole(Role::DISPATCHER);
    $headers = bearer($user);
    $user->forceFill(['is_active' => false])->save();

    $this->getJson('/api/v1/me', $headers)
        ->assertUnauthorized()
        ->assertJson(['code' => 'unauthenticated'])
        ->assertMatchesContract();
})->group('NFR-006', 'FR-002');
