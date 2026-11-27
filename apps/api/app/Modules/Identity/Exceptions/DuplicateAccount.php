<?php

namespace App\Modules\Identity\Exceptions;

use App\Support\Exceptions\DomainException;

/** 409 `email_taken` / `phone_taken` (FR-001; email is checked first). */
final class DuplicateAccount extends DomainException
{
    private function __construct(private readonly string $duplicateCode)
    {
        parent::__construct($duplicateCode);
    }

    public static function email(): self
    {
        return new self('email_taken');
    }

    public static function phone(): self
    {
        return new self('phone_taken');
    }

    public function status(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return $this->duplicateCode;
    }
}
