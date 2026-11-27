<?php

namespace App\Modules\Identity\Policies;

use App\Modules\Identity\Models\User;
use App\Modules\Identity\Queries\UserAccessQuery;

/**
 * Role administration (FR-004). Second line of defence behind `permission:role.manage`:
 * the FormRequest of replaceRolePermissions authorizes through this policy too.
 */
final class RolePolicy
{
    public function __construct(private readonly UserAccessQuery $access) {}

    public function manage(User $user): bool
    {
        $access = $this->access->find($user->id);

        return $access !== null && $access->isActive && $access->can('role.manage');
    }
}
