<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\TokenPairData;
use App\Modules\Identity\Exceptions\InvalidRefreshToken;
use App\Modules\Identity\Models\RefreshToken;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Refresh-token rotation with reuse detection (NFR-006, docs/plans/S1.md §2.4).
 *
 * The DBML has no token-family column, so a cache marker remembers which hashes were revoked by
 * rotation. Presenting such a token again is reuse: every refresh token of that user is revoked.
 * A token revoked by logout or a password change has no marker and is a plain 401.
 */
final class RefreshTokenAction
{
    private const REUSED = 'reused';

    private const INVALID = 'invalid';

    public function __construct(private readonly IssueTokenPairAction $issueTokens) {}

    public function handle(string $refreshToken): TokenPairData
    {
        $hash = IssueTokenPairAction::hash($refreshToken);

        $result = DB::transaction(function () use ($hash): TokenPairData|string {
            $token = RefreshToken::query()->where('token_hash', $hash)->lockForUpdate()->first();

            if ($token === null) {
                return self::INVALID;
            }
            if ($token->revoked_at !== null) {
                if (Cache::has(self::rotatedKey($hash))) {
                    RefreshToken::query()->where('user_id', $token->user_id)->whereNull('revoked_at')->update(['revoked_at' => now()]);

                    return self::REUSED;
                }

                return self::INVALID;
            }
            if ($token->expires_at->isPast() || ! $token->user->is_active) {
                return self::INVALID;
            }

            $token->forceFill(['revoked_at' => now()])->save();
            Cache::put(self::rotatedKey($hash), true, $token->expires_at);

            return $this->issueTokens->handle($token->user);
        });

        if ($result === self::REUSED) {
            // Security event; no token, user id or other personal data in the log (H6).
            Log::warning('identity.refresh_token_reuse_detected');
        }
        if (is_string($result)) {
            throw new InvalidRefreshToken;
        }

        return $result;
    }

    private static function rotatedKey(string $hash): string
    {
        return 'identity:refresh-rotated:'.$hash;
    }
}
