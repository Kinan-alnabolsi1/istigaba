<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\DTOs\PermissionData;
use App\Modules\Identity\Queries\RoleQuery;

/** listPermissions (FR-004): every D-34 permission code. */
final class ListPermissionsAction
{
    public function __construct(private readonly RoleQuery $roles) {}

    /** @return list<PermissionData> */
    public function handle(): array
    {
        return $this->roles->permissions();
    }
}
