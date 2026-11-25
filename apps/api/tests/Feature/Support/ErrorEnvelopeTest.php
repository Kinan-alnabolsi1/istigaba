<?php

use App\Support\Exceptions\DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

final class S0InvalidTransitionForTest extends DomainException
{
    public function status(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'invalid_state_transition';
    }
}

beforeEach(function () {
    Route::middleware('api')->prefix('api/v1/__s0')->group(function () {
        Route::post('/validate', fn (Request $r) => $r->validate(['name' => ['required', 'string']]));
        Route::get('/boom', fn () => throw new RuntimeException('secret internal detail'));
        Route::get('/conflict', fn () => throw new S0InvalidTransitionForTest);
        Route::get('/unauthenticated', fn () => throw new AuthenticationException);
        Route::get('/forbidden', fn () => throw new AuthorizationException);
        Route::get('/throttled', fn () => throw new ThrottleRequestsException('Too Many Attempts.', null, ['Retry-After' => 42]));
        Route::get('/only-get', fn () => ['ok' => true]);
    });
});

it('S0 unknown API routes return the contract error body in Arabic by default', function () {
    // Symfony's test requests default to "en-us"; an empty header models a client that sends none.
    $this->getJson('/api/v1/nowhere', ['Accept-Language' => ''])
        ->assertNotFound()
        ->assertExactJsonStructure(['code', 'message', 'request_id'])
        ->assertJson(['code' => 'not_found', 'message' => trans('errors.not_found', [], 'ar')])
        ->assertHeader('Content-Language', 'ar');
})->group('S0');

it('S0 error messages follow Accept-Language en', function () {
    $this->getJson('/api/v1/nowhere', ['Accept-Language' => 'en-US,en;q=0.9'])
        ->assertJson(['code' => 'not_found', 'message' => trans('errors.not_found', [], 'en')])
        ->assertHeader('Content-Language', 'en');
})->group('S0');

it('S0 unsupported languages fall back to Arabic', function () {
    $this->getJson('/api/v1/nowhere', ['Accept-Language' => 'fr-FR'])
        ->assertJson(['message' => trans('errors.not_found', [], 'ar')]);
})->group('S0');

it('S0 a wrong method is reported as not_found, using only contract error codes', function () {
    $this->postJson('/api/v1/__s0/only-get')->assertNotFound()->assertJson(['code' => 'not_found']);
})->group('S0');

it('S0 validation errors return 422 validation_failed with field errors', function () {
    $this->postJson('/api/v1/__s0/validate', [])
        ->assertStatus(422)
        ->assertJson(['code' => 'validation_failed'])
        ->assertJsonStructure(['code', 'message', 'request_id', 'errors' => ['name']]);
})->group('S0');

it('S0 typed domain exceptions map to their status and code', function () {
    $this->getJson('/api/v1/__s0/conflict')
        ->assertStatus(409)
        ->assertJson(['code' => 'invalid_state_transition']);
})->group('S0');

it('S0 authentication and authorization failures use contract codes', function () {
    $this->getJson('/api/v1/__s0/unauthenticated')->assertStatus(401)->assertJson(['code' => 'unauthenticated']);
    $this->getJson('/api/v1/__s0/forbidden')->assertStatus(403)->assertJson(['code' => 'forbidden']);
})->group('S0');

it('S0 rate limiting returns 429 rate_limited with Retry-After', function () {
    $this->getJson('/api/v1/__s0/throttled')
        ->assertStatus(429)
        ->assertJson(['code' => 'rate_limited'])
        ->assertHeader('Retry-After', '42');
})->group('S0');

it('S0 500 hides internals even when debug is on', function () {
    config(['app.debug' => true]);

    $response = $this->getJson('/api/v1/__s0/boom');

    $response->assertStatus(500)
        ->assertExactJsonStructure(['code', 'message', 'request_id'])
        ->assertJson(['code' => 'internal_error']);
    expect($response->getContent())->not->toContain('secret internal detail')->not->toContain('trace');
})->group('S0');
