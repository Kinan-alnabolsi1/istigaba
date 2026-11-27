<?php

use App\Modules\Identity\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

/** @return array{access_token: string, refresh_token: string} */
function loginPair(object $test, string $email): array
{
    return $test->postJson('/api/v1/auth/login', ['email' => $email, 'password' => UserFactory::PASSWORD])->assertOk()->json();
}

it('FR-003 logout revokes the refresh token', function () {
    userWithRole(Role::DISPATCHER, ['email' => 'd@example.com']);
    $pair = loginPair($this, 'd@example.com');

    $this->postJson('/api/v1/auth/logout', ['refresh_token' => $pair['refresh_token']], ['Authorization' => 'Bearer '.$pair['access_token']])
        ->assertNoContent();

    expect(DB::table('refresh_tokens')->where('token_hash', hash('sha256', $pair['refresh_token']))->value('revoked_at'))->not->toBeNull();
})->group('FR-003', 'NFR-006');

it('FR-003 the access token is rejected immediately after logout (jti denylist)', function () {
    userWithRole(Role::DISPATCHER, ['email' => 'd@example.com']);
    $pair = loginPair($this, 'd@example.com');
    $auth = ['Authorization' => 'Bearer '.$pair['access_token']];

    $this->getJson('/api/v1/me', $auth)->assertOk();
    $this->postJson('/api/v1/auth/logout', ['refresh_token' => $pair['refresh_token']], $auth)->assertNoContent();

    $this->getJson('/api/v1/me', $auth)
        ->assertUnauthorized()
        ->assertJson(['code' => 'unauthenticated'])
        ->assertMatchesContract();
})->group('FR-003', 'NFR-006');

it('FR-003 logout with a foreign, unknown or already revoked token still returns 204 and touches nothing else', function () {
    userWithRole(Role::CITIZEN, ['email' => 'a@example.com']);
    userWithRole(Role::CITIZEN, ['email' => 'b@example.com']);
    $alice = loginPair($this, 'a@example.com');
    $bob = loginPair($this, 'b@example.com');

    foreach ([$bob['refresh_token'], 'unknown-token'] as $token) {
        $this->postJson('/api/v1/auth/logout', ['refresh_token' => $token], ['Authorization' => 'Bearer '.$alice['access_token']])
            ->assertNoContent();
        // Alice's access token is now denylisted; log in again for the next round.
        $alice = loginPair($this, 'a@example.com');
    }

    expect(DB::table('refresh_tokens')->where('token_hash', hash('sha256', $bob['refresh_token']))->value('revoked_at'))->toBeNull();
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $bob['refresh_token']])->assertOk();
})->group('FR-003');

it('FR-003 logout requires authentication', function () {
    $this->postJson('/api/v1/auth/logout', ['refresh_token' => 'x'])
        ->assertUnauthorized()
        ->assertJson(['code' => 'unauthenticated'])
        ->assertMatchesContract();
})->group('FR-003');

it('FR-003 logout validates the body', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->postJson('/api/v1/auth/logout', [], bearer($user))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['refresh_token'])
        ->assertMatchesContract();
})->group('FR-003');
