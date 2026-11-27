<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Audit\Actions\RecordAuditEntryAction;
use App\Modules\Audit\DTOs\AuditEntryData;
use App\Modules\Identity\DTOs\RequestContextData;
use App\Modules\Identity\DTOs\TokenPairData;
use App\Modules\Identity\Exceptions\InvalidCurrentPassword;
use App\Modules\Identity\Models\RefreshToken;
use App\Modules\Identity\Models\User;
use App\Support\RateLimiting\LoginLockout;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\JWTAuth;

/**
 * changeMyPassword (D-38, NFR-006): requires the current password (wrong attempts count toward the
 * account lockout, plan Q4). On success: Argon2id re-hash, every refresh token revoked, the current
 * access token denylisted, a fresh pair returned. Audited without any password value.
 */
final class ChangeMyPasswordAction
{
    public function __construct(
        private readonly LoginLockout $lockout,
        private readonly IssueTokenPairAction $issueTokens,
        private readonly RecordAuditEntryAction $audit,
        private readonly JWTAuth $jwt,
    ) {}

    public function handle(string $userId, string $currentPassword, string $newPassword, RequestContextData $context): TokenPairData
    {
        $user = User::query()->findOrFail($userId);
        $this->lockout->ensureNotLocked($user->email, null);

        if (! Hash::check($currentPassword, $user->password_hash)) {
            foreach ($this->lockout->recordFailure($user->email, null) as $lock) {
                $this->audit->handle(new AuditEntryData(
                    action: 'auth.lockout',
                    entityType: 'user',
                    entityId: $user->id,
                    newValue: $lock,
                    ipAddress: $context->ipAddress,
                ));
            }

            throw new InvalidCurrentPassword;
        }

        $pair = DB::transaction(function () use ($user, $newPassword, $context): TokenPairData {
            $user->forceFill(['password_hash' => Hash::make($newPassword)])->save();
            RefreshToken::query()->where('user_id', $user->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);

            $this->audit->handle(new AuditEntryData(
                action: 'user.password_change',
                entityType: 'user',
                entityId: $user->id,
                actorId: $user->id,
                ipAddress: $context->ipAddress,
            ));

            return $this->issueTokens->handle($user);
        });

        if ($context->accessToken !== null) {
            $this->jwt->setToken($context->accessToken)->invalidate();
        }
        $this->lockout->clearAccount($user->email);

        return $pair;
    }
}
