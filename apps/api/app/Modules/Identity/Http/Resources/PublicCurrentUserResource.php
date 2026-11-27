<?php

namespace App\Modules\Identity\Http\Resources;

use App\Modules\Identity\DTOs\CurrentUserData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Contract `CurrentUser`: the caller's OWN profile, for every authenticated role (S0 Q1 `Public`
 * prefix). Never contains a password or token hash, or the precise location (write-only).
 *
 * @property CurrentUserData $resource
 */
final class PublicCurrentUserResource extends JsonResource
{
    public function __construct(CurrentUserData $resource)
    {
        parent::__construct($resource);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $user = $this->resource;

        return [
            'id' => $user->id,
            'full_name' => $user->fullName,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'field_unit' => $user->fieldUnit,
            'permissions' => $user->permissions,
            'is_active' => $user->isActive,
            'location_consent' => $user->locationConsent,
            'location_updated_at' => $user->locationUpdatedAt?->utc()->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
