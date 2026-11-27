<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Audit\Actions\RecordAuditEntryAction;
use App\Modules\Audit\DTOs\AuditEntryData;
use App\Modules\Identity\DTOs\TokenPairData;
use App\Modules\Identity\Exceptions\AccountDeactivated;
use App\Modules\Identity\Exceptions\InvalidCredentials;
use App\Modules\Identity\Models\User;
use App\Support\RateLimiting\LoginLockout;
use Illuminate\Support\Facades\Hash;

/**
 * FR-002 login for any role (docs/plans/S1.md §2.6):
 * lockout check → credential check (constant work for unknown emails) → activation → token pair.
 */
final class LoginAction
{
    private static ?string $dummyHash = null;

    public function __construct(
        private readonly LoginLockout $lockout,
        private readonly IssueTokenPairAction $issueTokens,
        private readonly RecordAuditEntryAction $audit,
    ) {}

    public function handle(string $email, string $password, ?string $ip): TokenPairData
    {
        $email = RegisterCitizenAction::normalizeEmail($email);
        $this->lockout->ensureNotLocked($email, $ip);

        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            // Unknown email: still run one Argon2id verify so timing does not reveal existence.
            Hash::check($password, self::$dummyHash ??= Hash::make(bin2hex(random_bytes(16))));
        }

        if ($user === null || ! Hash::check($password, $user->password_hash)) {
            foreach ($this->lockout->recordFailure($email, $ip) as $lock) {
                $this->audit->handle(new AuditEntryData(
                    action: 'auth.lockout',
                    entityType: $user !== null ? 'user' : 'login_identifier',
                    entityId: $user?->id,
                    newValue: $lock,
                    ipAddress: $ip,
                ));
            }

            throw new InvalidCredentials;
        }

        if (! $user->is_active) {
            throw new AccountDeactivated;
        }

        $this->lockout->clearAccount($email);

        return $this->issueTokens->handle($user);
    }
}
