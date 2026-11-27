<?php

namespace App\Modules\Identity\Exceptions;

use App\Support\Exceptions\DomainException;

/** 403: correct password, but the account is deactivated (FR-002). */
final class AccountDeactivated extends DomainException
{
    public function status(): int
    {
        return 403;
    }

    public function errorCode(): string
    {
        return 'account_deactivated';
    }
}
