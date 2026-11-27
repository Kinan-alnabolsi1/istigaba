<?php

namespace App\Modules\Identity\Queries;

use App\Modules\Identity\DTOs\PermissionData;
use App\Modules\Identity\DTOs\RoleData;
use App\Modules\Identity\Models\Role;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

/** Roles with their permissions, and the permission catalogue (FR-004, admin audience). */
final class RoleQuery
{
    /** @return list<RoleData> */
    public function all(): array
    {
        return DB::table('roles')->orderBy('id')->get()
            ->map(fn (object $role): RoleData => $this->toData($role))
            ->values()
            ->all();
    }

    public function find(int $roleId): RoleData
    {
        $role = DB::table('roles')->where('id', $roleId)->first();
        if ($role === null) {
            throw (new ModelNotFoundException)->setModel(Role::class, [$roleId]);
        }

        return $this->toData($role);
    }

    /** @return list<PermissionData> */
    public function permissions(): array
    {
        return DB::table('permissions')->orderBy('code')->get()
            ->map(fn (object $p): PermissionData => self::permission($p))
            ->values()
            ->all();
    }

    /** @return list<string> sorted codes granted to the role */
    public function codesOf(int $roleId): array
    {
        return DB::table('role_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('role_permissions.role_id', $roleId)
            ->orderBy('permissions.code')
            ->pluck('permissions.code')
            ->map(fn ($code): string => (string) $code)
            ->values()
            ->all();
    }

    private function toData(object $role): RoleData
    {
        $permissions = DB::table('role_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('role_permissions.role_id', $role->id)
            ->orderBy('permissions.code')
            ->get(['permissions.id', 'permissions.code', 'permissions.description'])
            ->map(fn (object $p): PermissionData => self::permission($p))
            ->values()
            ->all();

        return new RoleData((int) $role->id, (string) $role->name, $role->description === null ? null : (string) $role->description, $permissions);
    }

    private static function permission(object $p): PermissionData
    {
        return new PermissionData((int) $p->id, (string) $p->code, $p->description === null ? null : (string) $p->description);
    }
}
