<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Audit\Actions\RecordAuditEntryAction;
use App\Modules\Audit\DTOs\AuditEntryData;
use App\Modules\Identity\DTOs\RequestContextData;
use App\Modules\Identity\DTOs\RoleData;
use App\Modules\Identity\Models\Role;
use App\Modules\Identity\Queries\RoleQuery;
use Illuminate\Support\Facades\DB;

/**
 * replaceRolePermissions (FR-004): replaces the role's `role_permissions` rows in one transaction
 * and audits the old and new code lists. Roles are fixed; removing `identity.reveal` or
 * `role.manage` from the administrator is allowed and audited (D-08). Effective on the next
 * request, because authorization reads the mapping fresh per request.
 */
final class ReplaceRolePermissionsAction
{
    public function __construct(
        private readonly RoleQuery $roles,
        private readonly RecordAuditEntryAction $audit,
    ) {}

    /** @param list<int> $permissionIds */
    public function handle(int $roleId, array $permissionIds, string $actorId, RequestContextData $context): RoleData
    {
        DB::transaction(function () use ($roleId, $permissionIds, $actorId, $context): void {
            $role = Role::query()->whereKey($roleId)->lockForUpdate()->firstOrFail();
            $old = $this->roles->codesOf($role->id);

            $role->permissions()->sync($permissionIds);

            $this->audit->handle(new AuditEntryData(
                action: 'role.permissions_replace',
                entityType: 'role',
                entityId: (string) $role->id,
                actorId: $actorId,
                oldValue: ['permissions' => $old],
                newValue: ['permissions' => $this->roles->codesOf($role->id)],
                ipAddress: $context->ipAddress,
            ));
        });

        return $this->roles->find($roleId);
    }
}
