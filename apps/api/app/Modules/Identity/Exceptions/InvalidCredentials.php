<?php

namespace App\Modules\Identity\Exceptions;

use App\Support\Exceptions\DomainException;

/** 401: wrong email or password; identical for unknown emails (FR-002). */
final class InvalidCredentials extends DomainException
{
    public function status(): int
    {
        return 401;
    }

    public function errorCode(): string
    {
        return 'invalid_credentials';
    }
}
