<?php

use App\Modules\Identity\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

it('FR-002 logs in any role and issues a token pair', function (string $role) {
    $user = userWithRole($role, ['email' => 'staff@example.com']);

    $response = $this->postJson('/api/v1/auth/login', ['email' => 'staff@example.com', 'password' => UserFactory::PASSWORD])
        ->assertOk()
        ->assertMatchesContract()
        ->assertJson(['token_type' => 'Bearer', 'expires_in' => 900]);

    $refresh = $response->json('refresh_token');
    expect($refresh)->toBeString()->not->toBeEmpty()
        ->and(DB::table('refresh_tokens')->where('user_id', $user->id)->value('token_hash'))->toBe(hash('sha256', $refresh));

    $this->getJson('/api/v1/me', ['Authorization' => 'Bearer '.$response->json('access_token')])
        ->assertOk()
        ->assertJson(['id' => $user->id, 'role' => $role]);
})->with(Role::ALL)->group('FR-002', 'NFR-006');

it('FR-002 email is case-insensitive', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);

    $this->postJson('/api/v1/auth/login', ['email' => ' SARA@Example.com ', 'password' => UserFactory::PASSWORD])
        ->assertOk();
})->group('FR-002');

it('FR-002 a wrong password and an unknown email give the same 401 invalid_credentials body', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);

    $wrong = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'wrong-password'])
        ->assertUnauthorized()
        ->assertMatchesContract();
    $unknown = $this->postJson('/api/v1/auth/login', ['email' => 'nobody@example.com', 'password' => 'wrong-password'])
        ->assertUnauthorized()
        ->assertMatchesContract();

    expect($wrong->json('code'))->toBe('invalid_credentials')
        ->and($unknown->json('code'))->toBe('invalid_credentials')
        ->and($wrong->json('message'))->toBe($unknown->json('message'))
        ->and(DB::table('refresh_tokens')->count())->toBe(0);
})->group('FR-002');

it('FR-002 a deactivated account with the correct password gets 403 account_deactivated', function () {
    UserFactory::new()->inactive()->create(['email' => 'gone@example.com']);

    $this->postJson('/api/v1/auth/login', ['email' => 'gone@example.com', 'password' => UserFactory::PASSWORD])
        ->assertForbidden()
        ->assertJson(['code' => 'account_deactivated'])
        ->assertMatchesContract();

    expect(DB::table('refresh_tokens')->count())->toBe(0);
})->group('FR-002');

it('FR-002 a deactivated account with a wrong password gets invalid_credentials (no disclosure)', function () {
    UserFactory::new()->inactive()->create(['email' => 'gone@example.com']);

    $this->postJson('/api/v1/auth/login', ['email' => 'gone@example.com', 'password' => 'wrong-password'])
        ->assertUnauthorized()
        ->assertJson(['code' => 'invalid_credentials']);
})->group('FR-002');

it('FR-002 validates the login body', function (array $body, string $field) {
    $this->postJson('/api/v1/auth/login', $body)
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field])
        ->assertMatchesContract();
})->with([
    [['password' => 'x'], 'email'],
    [['email' => 'a@example.com'], 'password'],
    [['email' => 'a@example.com', 'password' => 'x', 'remember' => true], 'remember'],
])->group('FR-002');

it('NFR-011 limits login to 10 per minute per IP', function () {
    // Different emails, so the account lockout is not what triggers.
    foreach (range(1, 4) as $i) {
        $this->postJson('/api/v1/auth/login', ['email' => "u{$i}@example.com", 'password' => 'x']);
    }
    userWithRole(Role::CITIZEN, ['email' => 'ok@example.com']);
    foreach (range(1, 6) as $i) {
        $this->postJson('/api/v1/auth/login', ['email' => 'ok@example.com', 'password' => UserFactory::PASSWORD])->assertOk();
    }

    $this->postJson('/api/v1/auth/login', ['email' => 'ok@example.com', 'password' => UserFactory::PASSWORD])
        ->assertStatus(429)
        ->assertHeader('Retry-After')
        ->assertJson(['code' => 'rate_limited'])
        ->assertMatchesContract();
})->group('NFR-011');
