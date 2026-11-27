<?php

namespace App\Modules\Identity\Exceptions;

use App\Support\Exceptions\DomainException;

/** 401: refresh token unknown, expired, revoked or reused, or the user is inactive (NFR-006). */
final class InvalidRefreshToken extends DomainException
{
    public function status(): int
    {
        return 401;
    }

    public function errorCode(): string
    {
        return 'unauthenticated';
    }
}
