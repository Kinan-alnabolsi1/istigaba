<?php

namespace App\Modules\Identity\Exceptions;

use App\Support\Exceptions\DomainException;

/** 422 `invalid_current_password` with a field error on `current_password` (changeMyPassword). */
final class InvalidCurrentPassword extends DomainException
{
    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'invalid_current_password';
    }

    public function errors(): array
    {
        return ['current_password' => [(string) trans('errors.invalid_current_password')]];
    }
}
