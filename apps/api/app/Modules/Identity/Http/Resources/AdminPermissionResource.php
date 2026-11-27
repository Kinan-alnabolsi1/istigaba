<?php

namespace App\Modules\Identity\Http\Resources;

use App\Modules\Identity\DTOs\PermissionData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Contract `Permission` (admin audience).
 *
 * @property PermissionData $resource
 */
final class AdminPermissionResource extends JsonResource
{
    public function __construct(PermissionData $resource)
    {
        parent::__construct($resource);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'code' => $this->resource->code,
            'description' => $this->resource->description,
        ];
    }
}
