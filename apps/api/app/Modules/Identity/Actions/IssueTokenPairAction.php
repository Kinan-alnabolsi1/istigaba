<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\TokenPairData;
use App\Modules\Identity\Models\RefreshToken;
use App\Modules\Identity\Models\User;
use PHPOpenSourceSaver\JWTAuth\JWTAuth;

/**
 * Issues a 15-minute access JWT and a new opaque refresh token (NFR-006). Only the sha256 of the
 * refresh token is stored; the plain value exists only in this response.
 */
final class IssueTokenPairAction
{
    public function __construct(private readonly JWTAuth $jwt) {}

    public function handle(User $user): TokenPairData
    {
        $refresh = rtrim(strtr(base64_encode(random_bytes(48)), '+/', '-_'), '=');

        RefreshToken::query()->create([
            'user_id' => $user->id,
            'token_hash' => self::hash($refresh),
            'expires_at' => now()->addDays((int) config('istigaba.auth.refresh_ttl_days')),
        ]);

        return new TokenPairData(
            accessToken: $this->jwt->fromUser($user),
            refreshToken: $refresh,
            expiresIn: (int) config('jwt.ttl') * 60,
        );
    }

    public static function hash(string $refreshToken): string
    {
        return hash('sha256', $refreshToken);
    }
}
