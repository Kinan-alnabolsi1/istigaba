<?php

use App\Modules\Identity\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

function failLogin(object $test, string $email, string $ip = '10.0.0.1'): TestResponse
{
    return $test->withServerVariables(['REMOTE_ADDR' => $ip])
        ->postJson('/api/v1/auth/login', ['email' => $email, 'password' => 'wrong-password']);
}

function goodLogin(object $test, string $email, string $ip = '10.0.0.1'): TestResponse
{
    return $test->withServerVariables(['REMOTE_ADDR' => $ip])
        ->postJson('/api/v1/auth/login', ['email' => $email, 'password' => UserFactory::PASSWORD]);
}

it('NFR-011 five failures lock the account; even the correct password then gets 429 account_locked', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);

    foreach (range(1, 5) as $i) {
        // Each from another IP, so only the account key counts.
        failLogin($this, 'sara@example.com', "10.0.1.{$i}")->assertUnauthorized();
    }

    $locked = goodLogin($this, 'sara@example.com', '10.0.2.1')
        ->assertStatus(429)
        ->assertJson(['code' => 'account_locked'])
        ->assertHeader('Retry-After')
        ->assertMatchesContract();

    expect((int) $locked->headers->get('Retry-After'))->toBeGreaterThan(0)->toBeLessThanOrEqual(900);
})->group('NFR-011', 'FR-002');

it('NFR-011 five failures from one IP lock that IP across emails', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);

    foreach (range(1, 5) as $i) {
        failLogin($this, "victim{$i}@example.com", '10.0.0.9')->assertUnauthorized();
    }

    goodLogin($this, 'sara@example.com', '10.0.0.9')
        ->assertStatus(429)
        ->assertJson(['code' => 'account_locked']);
    goodLogin($this, 'sara@example.com', '10.0.0.10')->assertOk();
})->group('NFR-011');

it('NFR-011 an unknown email locks with the same body, so a lock never proves an account exists', function () {
    userWithRole(Role::CITIZEN, ['email' => 'real@example.com']);

    foreach (range(1, 5) as $i) {
        failLogin($this, 'real@example.com', "10.1.0.{$i}");
        failLogin($this, 'ghost@example.com', "10.2.0.{$i}");
    }

    $real = failLogin($this, 'real@example.com', '10.3.0.1')->assertStatus(429);
    $ghost = failLogin($this, 'ghost@example.com', '10.3.0.2')->assertStatus(429);

    expect($real->json('code'))->toBe($ghost->json('code'))
        ->and($real->json('message'))->toBe($ghost->json('message'));
})->group('NFR-011');

it('NFR-011 the lock expires after 15 minutes', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    foreach (range(1, 5) as $i) {
        failLogin($this, 'sara@example.com', "10.0.1.{$i}");
    }
    goodLogin($this, 'sara@example.com', '10.0.2.1')->assertStatus(429);

    $this->travel(16)->minutes();

    goodLogin($this, 'sara@example.com', '10.0.2.2')->assertOk();
})->group('NFR-011');

it('NFR-011 a success resets the account counter but not the IP counter', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com']);
    userWithRole(Role::CITIZEN, ['email' => 'mine@example.com']);

    foreach (range(1, 4) as $i) {
        failLogin($this, 'sara@example.com', '10.0.0.7');
    }
    // A success on the attacked account clears its counter...
    goodLogin($this, 'sara@example.com', '10.0.5.5')->assertOk();
    failLogin($this, 'sara@example.com', '10.0.5.6')->assertUnauthorized();

    // ...but a success from the attacking IP does not reset that IP's count (4 failures so far).
    goodLogin($this, 'mine@example.com', '10.0.0.7')->assertOk();
    failLogin($this, 'other@example.com', '10.0.0.7')->assertUnauthorized();
    goodLogin($this, 'mine@example.com', '10.0.0.7')->assertStatus(429);
})->group('NFR-011');

it('NFR-010 a lockout writes an auth.lockout audit row without any email, phone or password', function () {
    $user = userWithRole(Role::CITIZEN, ['email' => 'sara@example.com', 'phone' => '+963933111222']);

    foreach (range(1, 5) as $i) {
        failLogin($this, 'sara@example.com', "10.0.1.{$i}");
    }

    $rows = DB::table('audit_logs')->where('action', 'auth.lockout')->get();
    expect($rows)->toHaveCount(1);

    $row = $rows->first();
    expect($row->entity_type)->toBe('user')
        ->and($row->entity_id)->toBe($user->id)
        ->and($row->actor_id)->toBeNull()
        ->and($row->ip_address)->toBe('10.0.1.5')
        ->and(json_decode((string) $row->new_value, true))->toMatchArray(['scope' => 'account']);

    $serialized = json_encode($row);
    expect($serialized)->not->toContain('sara@example.com')
        ->and($serialized)->not->toContain('963933111222')
        ->and($serialized)->not->toContain('wrong-password');
})->group('NFR-010', 'NFR-012');

it('NFR-010 an IP lockout for an unknown email is audited as login_identifier with no id', function () {
    foreach (range(1, 5) as $i) {
        failLogin($this, "nobody{$i}@example.com", '10.9.9.9');
    }

    $row = DB::table('audit_logs')->where('action', 'auth.lockout')->first();
    expect($row)->not->toBeNull()
        ->and($row->entity_type)->toBe('login_identifier')
        ->and($row->entity_id)->toBeNull()
        ->and(json_decode((string) $row->new_value, true))->toMatchArray(['scope' => 'ip']);
})->group('NFR-010');
