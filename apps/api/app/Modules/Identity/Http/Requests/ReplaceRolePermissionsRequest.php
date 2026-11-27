<?php

namespace App\Modules\Identity\Http\Requests;

use App\Modules\Identity\Models\Role;
use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/** replaceRolePermissions (FR-004): the complete new set of permission ids. */
final class ReplaceRolePermissionsRequest extends FormRequest
{
    use RejectsUnknownFields;

    public function authorize(): bool
    {
        return Gate::allows('manage', Role::class);
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['integer', 'distinct', 'exists:permissions,id'],
        ];
    }

    /** @return list<int> */
    public function permissionIds(): array
    {
        $ids = $this->validated('permission_ids');

        return array_values(array_map('intval', is_array($ids) ? $ids : []));
    }
}
