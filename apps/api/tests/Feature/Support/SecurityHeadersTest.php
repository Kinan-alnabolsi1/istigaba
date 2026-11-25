<?php

it('NFR-008 security headers are present on API and health responses', function (string $uri) {
    $this->getJson($uri)
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'no-referrer')
        ->assertHeaderMissing('Strict-Transport-Security');
})->with(['/health', '/api/v1/nowhere'])->group('NFR-008');

it('NFR-008 HSTS is sent in production only', function () {
    $this->app->instance('env', 'production');

    $this->getJson('/health')->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
})->group('NFR-008');

it('NFR-008 CORS allows only the configured web origins', function () {
    $allowed = $this->call('OPTIONS', '/api/v1/nowhere', server: [
        'HTTP_ORIGIN' => 'http://localhost:5173',
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
    ]);
    $blocked = $this->call('OPTIONS', '/api/v1/nowhere', server: [
        'HTTP_ORIGIN' => 'https://evil.example',
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
    ]);

    expect($allowed->headers->get('Access-Control-Allow-Origin'))->toBe('http://localhost:5173')
        ->and($blocked->headers->get('Access-Control-Allow-Origin'))->toBeNull();
})->group('NFR-008');
