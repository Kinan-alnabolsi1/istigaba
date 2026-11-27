<?php

use App\Modules\Identity\Models\Role;
use Carbon\CarbonImmutable;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

/** @return array{access_token: string, refresh_token: string} */
function loginAs(object $test, string $email): array
{
    return $test->postJson('/api/v1/auth/login', ['email' => $email, 'password' => UserFactory::PASSWORD])
        ->assertOk()
        ->json();
}

it('NFR-006 rotation revokes the presented token and returns a new pair', function () {
    $user = userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $first = loginAs($this, 'sara@example.com');

    $second = $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $first['refresh_token']])
        ->assertOk()
        ->assertMatchesContract()
        ->json();

    expect($second['refresh_token'])->not->toBe($first['refresh_token'])
        ->and(DB::table('refresh_tokens')->where('token_hash', hash('sha256', $first['refresh_token']))->value('revoked_at'))->not->toBeNull()
        ->and(DB::table('refresh_tokens')->where('token_hash', hash('sha256', $second['refresh_token']))->value('revoked_at'))->toBeNull();

    $this->getJson('/api/v1/me', ['Authorization' => 'Bearer '.$second['access_token']])
        ->assertOk()->assertJson(['id' => $user->id]);
})->group('NFR-006', 'FR-002');

it('NFR-006 an unknown or expired refresh token gives 401 unauthenticated', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $pair = loginAs($this, 'sara@example.com');

    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => 'not-a-real-token'])
        ->assertUnauthorized()->assertJson(['code' => 'unauthenticated'])->assertMatchesContract();

    $this->travel(31)->days();

    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $pair['refresh_token']])
        ->assertUnauthorized()->assertJson(['code' => 'unauthenticated']);
})->group('NFR-006');

it('NFR-006 refresh tokens expire after 30 days', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $pair = loginAs($this, 'sara@example.com');

    $expires = DB::table('refresh_tokens')->where('token_hash', hash('sha256', $pair['refresh_token']))->value('expires_at');

    expect(abs(now()->addDays(30)->diffInSeconds(CarbonImmutable::parse($expires))))->toBeLessThan(5);
})->group('NFR-006');

it('NFR-006 reusing a rotated token revokes every refresh token of that user', function () {
    $user = userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $otherDevice = loginAs($this, 'sara@example.com');
    $first = loginAs($this, 'sara@example.com');
    $second = $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $first['refresh_token']])->assertOk()->json();

    // An attacker replays the stolen, already rotated token.
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $first['refresh_token']])
        ->assertUnauthorized()->assertJson(['code' => 'unauthenticated']);

    expect(DB::table('refresh_tokens')->where('user_id', $user->id)->whereNull('revoked_at')->count())->toBe(0);
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $second['refresh_token']])->assertUnauthorized();
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $otherDevice['refresh_token']])->assertUnauthorized();
})->group('NFR-006');

it('NFR-006 a token revoked by logout gives 401 without revoking the other sessions', function () {
    $user = userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $phone = loginAs($this, 'sara@example.com');
    $laptop = loginAs($this, 'sara@example.com');

    $this->postJson('/api/v1/auth/logout', ['refresh_token' => $phone['refresh_token']], ['Authorization' => 'Bearer '.$phone['access_token']])
        ->assertNoContent();

    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $phone['refresh_token']])->assertUnauthorized();
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $laptop['refresh_token']])->assertOk();
})->group('NFR-006', 'FR-003');

it('NFR-006 a deactivated user cannot refresh', function () {
    $user = userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $pair = loginAs($this, 'sara@example.com');
    $user->forceFill(['is_active' => false])->save();

    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $pair['refresh_token']])
        ->assertUnauthorized()->assertJson(['code' => 'unauthenticated']);
})->group('NFR-006');

it('NFR-006 only a sha256 hash of the refresh token is stored', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $pair = loginAs($this, 'sara@example.com');

    expect(DB::table('refresh_tokens')->where('token_hash', $pair['refresh_token'])->exists())->toBeFalse()
        ->and(DB::table('refresh_tokens')->where('token_hash', hash('sha256', $pair['refresh_token']))->exists())->toBeTrue();
})->group('NFR-006');

it('NFR-011 limits refresh to 30 per minute per IP', function () {
    foreach (range(1, 30) as $i) {
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => "bogus-{$i}"])->assertUnauthorized();
    }

    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => 'bogus'])
        ->assertStatus(429)->assertHeader('Retry-After')->assertMatchesContract();
})->group('NFR-011');
