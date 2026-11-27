<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\Models\RefreshToken;
use PHPOpenSourceSaver\JWTAuth\JWTAuth;

/**
 * FR-003: revokes the caller's refresh token (only if it is theirs; otherwise a silent no-op so
 * nothing is revealed) and denylists the current access token's `jti` until it expires (D-05).
 */
final class LogoutAction
{
    public function __construct(private readonly JWTAuth $jwt) {}

    public function handle(string $userId, string $refreshToken, string $accessToken): void
    {
        RefreshToken::query()
            ->where('token_hash', IssueTokenPairAction::hash($refreshToken))
            ->where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        $this->jwt->setToken($accessToken)->invalidate();
    }
}
