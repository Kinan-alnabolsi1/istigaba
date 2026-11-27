<?php

namespace App\Modules\Identity\DTOs;

/** Who is calling and from where: for audit rows and the lockout (never logged). */
final readonly class RequestContextData
{
    public function __construct(
        public ?string $ipAddress,
        public ?string $accessToken = null,
    ) {}
}
