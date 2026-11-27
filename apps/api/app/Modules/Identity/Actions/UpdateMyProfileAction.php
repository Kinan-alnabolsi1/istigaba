<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Audit\Actions\RecordAuditEntryAction;
use App\Modules\Audit\DTOs\AuditEntryData;
use App\Modules\Identity\DTOs\CurrentUserData;
use App\Modules\Identity\DTOs\ProfileUpdateData;
use App\Modules\Identity\DTOs\RequestContextData;
use App\Modules\Identity\Exceptions\DuplicateAccount;
use App\Modules\Identity\Models\User;
use App\Modules\Identity\Queries\CurrentUserQuery;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * updateMyProfile (D-38): own name, email, phone. Email and phone stay unique (409). Audited as
 * `user.profile_update` with the changed field NAMES only: email and phone are personal data and
 * audit rows are permanent (H4, H6).
 */
final class UpdateMyProfileAction
{
    public function __construct(
        private readonly CurrentUserQuery $currentUser,
        private readonly RecordAuditEntryAction $audit,
    ) {}

    public function handle(string $userId, ProfileUpdateData $data, RequestContextData $context): CurrentUserData
    {
        $changes = $data->changes;
        if (array_key_exists('email', $changes)) {
            $changes['email'] = RegisterCitizenAction::normalizeEmail($changes['email']);
        }

        RegisterCitizenAction::ensureUnique($changes['email'] ?? null, $changes['phone'] ?? null, $userId);

        try {
            DB::transaction(function () use ($userId, $changes, $context): void {
                User::query()->whereKey($userId)->lockForUpdate()->firstOrFail()->forceFill($changes)->save();

                $fields = array_keys($changes);
                sort($fields);
                $this->audit->handle(new AuditEntryData(
                    action: 'user.profile_update',
                    entityType: 'user',
                    entityId: $userId,
                    actorId: $userId,
                    newValue: ['fields' => $fields],
                    ipAddress: $context->ipAddress,
                ));
            });
        } catch (UniqueConstraintViolationException) {
            RegisterCitizenAction::ensureUnique($changes['email'] ?? null, $changes['phone'] ?? null, $userId);
            throw DuplicateAccount::email();
        }

        return $this->currentUser->find($userId);
    }
}
