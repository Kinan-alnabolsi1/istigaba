<?php

namespace App\Modules\Identity\Http\Resources;

use App\Modules\Identity\DTOs\PermissionData;
use App\Modules\Identity\DTOs\RoleData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Contract `Role` with its permissions (admin audience).
 *
 * @property RoleData $resource
 */
final class AdminRoleResource extends JsonResource
{
    public function __construct(RoleData $resource)
    {
        parent::__construct($resource);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'description' => $this->resource->description,
            'permissions' => array_map(
                fn (PermissionData $p): array => (new AdminPermissionResource($p))->toArray($request),
                $this->resource->permissions,
            ),
        ];
    }
}
