<?php

namespace App\Modules\Identity\Actions;

use App\Modules\Identity\Exceptions\LocationConsentRequired;
use App\Modules\Identity\Models\User;
use Illuminate\Support\Facades\DB;
use MatanYadaev\EloquentSpatial\Enums\Srid;
use MatanYadaev\EloquentSpatial\Objects\Point;

/**
 * updateMyLocation (FR-012/FR-027, write side): stores the caller's last known position, only with
 * consent (409 otherwise). The position is write-only for clients (NFR-016).
 */
final class UpdateMyLocationAction
{
    public function handle(string $userId, float $latitude, float $longitude): void
    {
        DB::transaction(function () use ($userId, $latitude, $longitude): void {
            $user = User::query()->whereKey($userId)->lockForUpdate()->firstOrFail();

            if (! $user->location_consent) {
                throw new LocationConsentRequired;
            }

            $user->forceFill([
                'last_known_location' => new Point($latitude, $longitude, Srid::WGS84),
                'location_updated_at' => now(),
            ])->save();
        });
    }
}
