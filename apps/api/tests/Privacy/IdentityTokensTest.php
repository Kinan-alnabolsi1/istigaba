<?php

use App\Modules\Identity\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Log\Events\MessageLogged;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

it('NFR-012 identity flows never log passwords, tokens, emails or phone numbers (H6)', function () {
    $logged = [];
    Event::listen(MessageLogged::class, function (MessageLogged $e) use (&$logged): void {
        $logged[] = $e->message.' '.json_encode($e->context);
    });

    $this->postJson('/api/v1/auth/register', [
        'full_name' => 'Sara', 'email' => 'sara@example.com', 'phone' => '+963933123456', 'password' => 'secret-pass-1',
    ])->assertCreated();
    $pair = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'secret-pass-1'])->json();
    $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'wrong-pass-1'])->assertUnauthorized();
    $rotated = $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $pair['refresh_token']])->json();
    // Reuse detection is the one place that logs a security event.
    $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $pair['refresh_token']])->assertUnauthorized();
    $fresh = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => 'secret-pass-1'])->json();
    $this->postJson('/api/v1/me/password', ['current_password' => 'secret-pass-1', 'new_password' => 'secret-pass-2'], ['Authorization' => 'Bearer '.$fresh['access_token']])->assertOk();

    $all = implode("\n", $logged);
    foreach (['secret-pass-1', 'secret-pass-2', 'wrong-pass-1', 'sara@example.com', '963933123456',
        $pair['access_token'], $pair['refresh_token'], $rotated['refresh_token'], $fresh['access_token']] as $secret) {
        expect($all)->not->toContain($secret);
    }
})->group('NFR-012', 'NFR-006');

it('NFR-012 the access token carries no identity claims beyond sub', function () {
    userWithRole(Role::CITIZEN, ['email' => 'sara@example.com', 'phone' => '+963933123456']);

    $token = $this->postJson('/api/v1/auth/login', ['email' => 'sara@example.com', 'password' => UserFactory::PASSWORD])
        ->json('access_token');
    $payload = json_decode(base64_decode(strtr(explode('.', $token)[1], '-_', '+/')), true);

    expect(array_keys($payload))->toEqualCanonicalizing(['iss', 'iat', 'exp', 'nbf', 'jti', 'sub', 'prv']);
    expect(json_encode($payload))->not->toContain('sara')->not->toContain('963933123456')->not->toContain('Citizen');
})->group('NFR-012', 'NFR-006');
