<?php

use Illuminate\Support\Facades\Hash;

it('NFR-006 passwords are hashed with Argon2id (D-06)', function () {
    expect(config('hashing.driver'))->toBe('argon2id')
        ->and(str_starts_with(Hash::make('password-123'), '$argon2id$'))->toBeTrue();
})->group('NFR-006');
