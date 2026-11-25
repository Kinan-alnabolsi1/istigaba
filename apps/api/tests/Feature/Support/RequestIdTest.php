<?php

const S0_UUID_V4 = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/';

it('S0 request id is generated when the client sends none', function () {
    $id = $this->getJson('/health')->headers->get('X-Request-Id');

    expect($id)->toMatch(S0_UUID_V4);
})->group('S0');

it('S0 a well-formed incoming request id is echoed', function () {
    $this->getJson('/health', ['X-Request-Id' => 'mobile-retry-0001'])
        ->assertHeader('X-Request-Id', 'mobile-retry-0001');
})->group('S0');

it('S0 a malformed incoming request id is replaced', function (string $bad) {
    $id = $this->getJson('/health', ['X-Request-Id' => $bad])->headers->get('X-Request-Id');

    expect($id)->not->toBe($bad)->toMatch(S0_UUID_V4);
})->with(['short', 'has spaces in it', 'semi;colon-12345', str_repeat('a', 65)])->group('S0');

it('S0 error bodies carry the same request id as the response header', function () {
    $response = $this->getJson('/api/v1/does-not-exist');

    $response->assertNotFound();
    expect($response->json('request_id'))->toBe($response->headers->get('X-Request-Id'));
})->group('S0');
