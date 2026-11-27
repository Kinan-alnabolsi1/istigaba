<?php

namespace App\Modules\Identity\Queries;

use App\Modules\Identity\DTOs\UserAccessData;
use Illuminate\Support\Facades\DB;

/**
 * Role, permission codes and activation of a user, read fresh from the database. Callers memoize
 * it on the request (one query pair per request), so a role-permission change applies on the next
 * request without any cache to invalidate (FR-004).
 */
final class UserAccessQuery
{
    public function find(string $userId): ?UserAccessData
    {
        $row = DB::table('users')
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->where('users.id', $userId)
            ->first(['users.role_id', 'users.is_active', 'roles.name as role_name']);

        if ($row === null) {
            return null;
        }

        $permissions = DB::table('role_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('role_permissions.role_id', $row->role_id)
            ->orderBy('permissions.code')
            ->pluck('permissions.code')
            ->map(fn ($code): string => (string) $code)
            ->values()
            ->all();

        return new UserAccessData($userId, (string) $row->role_name, $permissions, (bool) $row->is_active);
    }
}
