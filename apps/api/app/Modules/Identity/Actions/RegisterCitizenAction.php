<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\CurrentUserData;
use App\Modules\Identity\DTOs\RegisterCitizenData;
use App\Modules\Identity\Exceptions\DuplicateAccount;
use App\Modules\Identity\Models\Role;
use App\Modules\Identity\Models\User;
use App\Modules\Identity\Queries\CurrentUserQuery;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Hash;

/**
 * FR-001: self-registration creates a Citizen and nothing else. The role is fixed here, never
 * taken from the request (staff accounts come only from createUser, S2). No tokens are issued.
 */
final class RegisterCitizenAction
{
    public function __construct(private readonly CurrentUserQuery $currentUser) {}

    public function handle(RegisterCitizenData $data): CurrentUserData
    {
        $email = self::normalizeEmail($data->email);
        self::ensureUnique($email, $data->phone);

        $roleId = Role::query()->where('name', Role::CITIZEN)->valueOrFail('id');

        try {
            $user = User::query()->create([
                'role_id' => $roleId,
                'full_name' => $data->fullName,
                'email' => $email,
                'phone' => $data->phone,
                'password_hash' => Hash::make($data->password),
                'is_active' => true,
                'location_consent' => false,
            ]);
        } catch (UniqueConstraintViolationException) {
            // Lost a race with a concurrent registration: report which identifier clashed.
            self::ensureUnique($email, $data->phone);
            throw DuplicateAccount::email();
        }

        return $this->currentUser->find($user->id);
    }

    public static function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    /** @throws DuplicateAccount */
    public static function ensureUnique(?string $email, ?string $phone, ?string $exceptUserId = null): void
    {
        $others = fn () => User::query()->when($exceptUserId !== null, fn ($q) => $q->whereKeyNot($exceptUserId));

        if ($email !== null && $others()->where('email', $email)->exists()) {
            throw DuplicateAccount::email();
        }
        if ($phone !== null && $others()->where('phone', $phone)->exists()) {
            throw DuplicateAccount::phone();
        }
    }
}
