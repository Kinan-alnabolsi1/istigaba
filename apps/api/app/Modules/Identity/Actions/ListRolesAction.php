<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\RoleData;
use App\Modules\Identity\Queries\RoleQuery;

/** listRoles (FR-004): the four roles with their permissions. */
final class ListRolesAction
{
    public function __construct(private readonly RoleQuery $roles) {}

    /** @return list<RoleData> */
    public function handle(): array
    {
        return $this->roles->all();
    }
}
