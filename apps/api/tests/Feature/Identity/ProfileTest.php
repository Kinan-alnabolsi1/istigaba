<?php

use App\Modules\Identity\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

// updateMyProfile is an approved x-proposed operation (D-38) with no SRS FR; its uniqueness and
// validation rules are those of FR-001.

it('FR-001 D-38 updates own name, email and phone', function () {
    $user = userWithRole(Role::DISPATCHER);

    $this->patchJson('/api/v1/me', ['full_name' => 'New Name', 'email' => 'NEW@example.com', 'phone' => '+963944000111'], bearer($user))
        ->assertOk()
        ->assertMatchesContract()
        ->assertJson(['full_name' => 'New Name', 'email' => 'new@example.com', 'phone' => '+963944000111', 'role' => Role::DISPATCHER]);
})->group('FR-001', 'D-38');

it('FR-001 D-38 phone may be cleared with null', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->patchJson('/api/v1/me', ['phone' => null], bearer($user))
        ->assertOk()->assertJson(['phone' => null]);
})->group('FR-001', 'D-38');

it('FR-001 D-38 keeping the own email is not a conflict', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->patchJson('/api/v1/me', ['email' => strtoupper($user->email)], bearer($user))->assertOk();
})->group('FR-001', 'D-38');

it('FR-001 D-38 another account\'s email or phone gives 409 email_taken / phone_taken', function () {
    $other = userWithRole(Role::CITIZEN);
    $user = userWithRole(Role::CITIZEN);

    $this->patchJson('/api/v1/me', ['email' => $other->email], bearer($user))
        ->assertStatus(409)->assertJson(['code' => 'email_taken'])->assertMatchesContract();
    $this->patchJson('/api/v1/me', ['phone' => $other->phone], bearer($user))
        ->assertStatus(409)->assertJson(['code' => 'phone_taken'])->assertMatchesContract();
})->group('FR-001', 'D-38');

it('FR-001 D-38 validates the body', function (array $body, string $field) {
    $user = userWithRole(Role::CITIZEN);

    $this->patchJson('/api/v1/me', $body, bearer($user))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field])
        ->assertMatchesContract();
})->with([
    'role cannot change' => [['role' => 'System Administrator'], 'role'],
    'activation cannot change' => [['is_active' => false], 'is_active'],
    'bad phone' => [['phone' => '12345'], 'phone'],
    'bad email' => [['email' => 'x'], 'email'],
    'long name' => [['full_name' => str_repeat('a', 151)], 'full_name'],
])->group('FR-001', 'D-38');

it('FR-001 D-38 an empty body is rejected', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->patchJson('/api/v1/me', [], bearer($user))
        ->assertUnprocessable()->assertJson(['code' => 'validation_failed']);
})->group('FR-001', 'D-38');

it('NFR-010 D-38 the change is audited with field names only', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->patchJson('/api/v1/me', ['email' => 'secret-new@example.com', 'phone' => '+963955000222'], bearer($user))->assertOk();

    $row = DB::table('audit_logs')->where('action', 'user.profile_update')->first();
    expect($row)->not->toBeNull()
        ->and($row->actor_id)->toBe($user->id)
        ->and($row->entity_type)->toBe('user')
        ->and($row->entity_id)->toBe($user->id)
        ->and(json_decode((string) $row->new_value, true))->toBe(['fields' => ['email', 'phone']]);
    expect(json_encode($row))->not->toContain('secret-new')->not->toContain('963955000222');
})->group('NFR-010', 'D-38');
