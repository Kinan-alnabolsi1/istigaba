<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\CurrentUserData;
use App\Modules\Identity\Queries\CurrentUserQuery;

/** FR-002/FR-004: the caller's own profile, role and permission codes. */
final class GetCurrentUserAction
{
    public function __construct(private readonly CurrentUserQuery $currentUser) {}

    public function handle(string $userId): CurrentUserData
    {
        return $this->currentUser->find($userId);
    }
}
