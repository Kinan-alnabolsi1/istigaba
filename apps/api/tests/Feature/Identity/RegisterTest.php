<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

/** @return array<string, mixed> */
function registration(array $overrides = []): array
{
    return array_merge([
        'full_name' => 'سارة أحمد',
        'email' => 'Sara@Example.com',
        'phone' => '+963933123456',
        'password' => 'password-123',
    ], $overrides);
}

it('FR-001 registers a citizen and returns the CurrentUser without tokens', function () {
    $response = $this->postJson('/api/v1/auth/register', registration())
        ->assertCreated()
        ->assertMatchesContract();

    $response->assertJson([
        'full_name' => 'سارة أحمد',
        'email' => 'sara@example.com',
        'phone' => '+963933123456',
        'role' => 'Citizen',
        'field_unit' => null,
        'permissions' => [],
        'is_active' => true,
        'location_consent' => false,
        'location_updated_at' => null,
    ]);
    expect($response->json())->not->toHaveKeys(['access_token', 'refresh_token', 'password', 'password_hash']);

    $user = DB::table('users')->where('email', 'sara@example.com')->first();
    expect(str_starts_with($user->password_hash, '$argon2id$'))->toBeTrue();
})->group('FR-001', 'NFR-006');

it('FR-001 rejects a duplicate email with 409 email_taken (case-insensitive)', function () {
    $this->postJson('/api/v1/auth/register', registration())->assertCreated();

    $this->postJson('/api/v1/auth/register', registration(['email' => 'SARA@example.com', 'phone' => '+963933000999']))
        ->assertStatus(409)
        ->assertJson(['code' => 'email_taken'])
        ->assertMatchesContract();
})->group('FR-001');

it('FR-001 rejects a duplicate phone with 409 phone_taken', function () {
    $this->postJson('/api/v1/auth/register', registration())->assertCreated();

    $this->postJson('/api/v1/auth/register', registration(['email' => 'other@example.com']))
        ->assertStatus(409)
        ->assertJson(['code' => 'phone_taken'])
        ->assertMatchesContract();
})->group('FR-001');

it('FR-001 validates every field with 422 field errors', function (array $body, string $field) {
    $this->postJson('/api/v1/auth/register', registration($body))
        ->assertUnprocessable()
        ->assertJson(['code' => 'validation_failed'])
        ->assertJsonValidationErrors([$field])
        ->assertMatchesContract();
})->with([
    'missing name' => [['full_name' => ''], 'full_name'],
    'long name' => [['full_name' => str_repeat('a', 151)], 'full_name'],
    'bad email' => [['email' => 'not-an-email'], 'email'],
    'missing phone' => [['phone' => null], 'phone'],
    'local phone' => [['phone' => '0933123456'], 'phone'],
    'short password' => [['password' => 'short7!'], 'password'],
])->group('FR-001', 'NFR-006');

it('FR-001 rejects unknown fields so no other role can self-register', function (string $field, mixed $value) {
    $this->postJson('/api/v1/auth/register', registration([$field => $value]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field]);

    expect(DB::table('users')->count())->toBe(0);
})->with([
    ['role', 'System Administrator'],
    ['role_id', 4],
    ['field_unit_id', 1],
    ['is_active', true],
])->group('FR-001', 'FR-004');

it('FR-001 validation messages are localized (Arabic default, English on request)', function () {
    // Symfony test requests default to "en-us"; an empty header models a client that sends none.
    $ar = $this->postJson('/api/v1/auth/register', registration(['email' => 'bad']), ['Accept-Language' => ''])->json('errors.email.0');
    $en = $this->postJson('/api/v1/auth/register', registration(['email' => 'bad']), ['Accept-Language' => 'en'])->json('errors.email.0');

    expect($ar)->toContain('البريد الإلكتروني')
        ->and($en)->toContain('email')
        ->and($en)->not->toMatch('/\p{Arabic}/u');
})->group('FR-001');

it('NFR-011 limits registration to 5 per hour per IP', function () {
    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/auth/register', registration([
            'email' => "user{$i}@example.com",
            'phone' => "+96393300000{$i}",
        ]))->assertCreated();
    }

    $this->postJson('/api/v1/auth/register', registration(['email' => 'six@example.com', 'phone' => '+963933000006']))
        ->assertStatus(429)
        ->assertHeader('Retry-After')
        ->assertJson(['code' => 'rate_limited'])
        ->assertMatchesContract();
})->group('NFR-011');
