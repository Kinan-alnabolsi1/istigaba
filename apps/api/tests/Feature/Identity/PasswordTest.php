<?php

use App\Modules\Identity\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

it('NFR-006 D-38 changes the password, revokes every refresh token and returns a new pair', function () {
    $user = userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    $other = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => UserFactory::PASSWORD])->json();
    $current = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => UserFactory::PASSWORD])->json();
    $auth = ['Authorization' => 'Bearer '.$current['access_token']];

    $pair = $this->postJson('/api/v1/me/password', ['current_password' => UserFactory::PASSWORD, 'new_password' => 'brand-new-pass'], $auth)
        ->assertOk()
        ->assertMatchesContract()
        ->json();

    // Old sessions are gone, including the current access token (denylisted).
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $other['refresh_token']])->assertUnauthorized();
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $current['refresh_token']])->assertUnauthorized();
    $this->getJson('/api/v1/me', $auth)->assertUnauthorized();

    // The new pair works, and so does the new password.
    $this->getJson('/api/v1/me', ['Authorization' => 'Bearer '.$pair['access_token']])->assertOk();
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $pair['refresh_token']])->assertOk();
    $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'brand-new-pass'])->assertOk();

    expect(str_starts_with((string) DB::table('users')->where('id', $user->id)->value('password_hash'), '$argon2id$'))->toBeTrue();
})->group('NFR-006', 'D-38');

it('NFR-006 D-38 a wrong current password gives 422 invalid_current_password and changes nothing', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->postJson('/api/v1/me/password', ['current_password' => 'wrong-password', 'new_password' => 'brand-new-pass'], bearer($user))
        ->assertUnprocessable()
        ->assertJson(['code' => 'invalid_current_password'])
        ->assertJsonValidationErrors(['current_password'])
        ->assertMatchesContract();

    expect(Hash::check(UserFactory::PASSWORD, (string) DB::table('users')->where('id', $user->id)->value('password_hash')))->toBeTrue();
})->group('NFR-006', 'D-38');

it('NFR-011 D-38 wrong current passwords count toward the account lockout', function () {
    $user = userWithRole(Role::CITIZEN);
    $headers = bearer($user);

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/me/password', ['current_password' => "wrong-{$i}-pass", 'new_password' => 'brand-new-pass'], $headers)
            ->assertUnprocessable();
    }

    $this->postJson('/api/v1/me/password', ['current_password' => UserFactory::PASSWORD, 'new_password' => 'brand-new-pass'], $headers)
        ->assertStatus(429)
        ->assertJson(['code' => 'account_locked'])
        ->assertMatchesContract();
})->group('NFR-011', 'D-38');

it('NFR-006 D-38 the new password needs at least 8 characters', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->postJson('/api/v1/me/password', ['current_password' => UserFactory::PASSWORD, 'new_password' => 'short7!'], bearer($user))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['new_password'])
        ->assertMatchesContract();
})->group('NFR-006', 'D-38');

it('NFR-010 D-38 the change is audited without any password value', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->postJson('/api/v1/me/password', ['current_password' => UserFactory::PASSWORD, 'new_password' => 'brand-new-pass'], bearer($user))->assertOk();

    $row = DB::table('audit_logs')->where('action', 'user.password_change')->first();
    expect($row)->not->toBeNull()
        ->and($row->actor_id)->toBe($user->id)
        ->and($row->old_value)->toBeNull()
        ->and($row->new_value)->toBeNull();
    expect(json_encode($row))->not->toContain('brand-new-pass')->not->toContain(UserFactory::PASSWORD);
})->group('NFR-010', 'D-38');
