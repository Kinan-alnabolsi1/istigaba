<?php

namespace App\Modules\Identity\DTOs;

/** Access JWT + opaque refresh token (contract `TokenPair`). */
final readonly class TokenPairData
{
    public function __construct(
        public string $accessToken,
        public string $refreshToken,
        public int $expiresIn,
    ) {}
}
