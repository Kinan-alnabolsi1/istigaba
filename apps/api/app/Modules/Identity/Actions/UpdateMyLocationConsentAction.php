<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\Models\User;

/**
 * FR-027 / D-15: grant or revoke location consent. Revoking clears the stored location and its
 * timestamp in the same update, so no stale position can ever be used for alert targeting.
 */
final class UpdateMyLocationConsentAction
{
    public function handle(string $userId, bool $consent): void
    {
        $changes = $consent
            ? ['location_consent' => true]
            : ['location_consent' => false, 'last_known_location' => null, 'location_updated_at' => null];

        User::query()->whereKey($userId)->firstOrFail()->forceFill($changes)->save();
    }
}
