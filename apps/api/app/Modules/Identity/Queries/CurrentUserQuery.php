<?php

namespace App\Modules\Identity\Queries;

use App\Modules\Identity\DTOs\CurrentUserData;
use App\Modules\Identity\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

/** Loads the caller's own `CurrentUser` projection: role name, unit and sorted permission codes. */
final class CurrentUserQuery
{
    public function find(string $userId): CurrentUserData
    {
        $row = DB::table('users')
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->leftJoin('field_units', 'field_units.id', '=', 'users.field_unit_id')
            ->where('users.id', $userId)
            ->first([
                'users.id', 'users.full_name', 'users.email', 'users.phone', 'users.role_id',
                'users.is_active', 'users.location_consent', 'users.location_updated_at',
                'roles.name as role_name',
                'field_units.id as unit_id', 'field_units.name as unit_name', 'field_units.unit_type as unit_type',
            ]);

        if ($row === null) {
            throw (new ModelNotFoundException)->setModel(User::class, [$userId]);
        }

        $permissions = DB::table('role_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('role_permissions.role_id', $row->role_id)
            ->orderBy('permissions.code')
            ->pluck('permissions.code')
            ->map(fn ($code): string => (string) $code)
            ->values()
            ->all();

        return new CurrentUserData(
            id: (string) $row->id,
            fullName: (string) $row->full_name,
            email: (string) $row->email,
            phone: $row->phone === null ? null : (string) $row->phone,
            role: (string) $row->role_name,
            fieldUnit: $row->unit_id === null ? null : [
                'id' => (int) $row->unit_id,
                'name' => (string) $row->unit_name,
                'unit_type' => (string) $row->unit_type,
            ],
            permissions: $permissions,
            isActive: (bool) $row->is_active,
            locationConsent: (bool) $row->location_consent,
            locationUpdatedAt: $row->location_updated_at === null ? null : CarbonImmutable::parse((string) $row->location_updated_at),
        );
    }
}
