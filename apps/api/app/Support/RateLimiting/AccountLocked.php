<?php

namespace App\Support\RateLimiting;

use App\Support\Exceptions\DomainException;

/** 429 `account_locked` + Retry-After: sign-in is locked after repeated failures (H6, NFR-011). */
final class AccountLocked extends DomainException
{
    public function __construct(private readonly int $retryAfterSeconds)
    {
        parent::__construct('Sign-in is locked.');
    }

    public function status(): int
    {
        return 429;
    }

    public function errorCode(): string
    {
        return 'account_locked';
    }

    public function headers(): array
    {
        return ['Retry-After' => (string) max(1, $this->retryAfterSeconds)];
    }
}
