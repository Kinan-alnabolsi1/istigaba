<?php

namespace App\Modules\Identity\Exceptions;

use App\Support\Exceptions\DomainException;

/** 409: a location update without location consent (FR-027). */
final class LocationConsentRequired extends DomainException
{
    public function status(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'location_consent_required';
    }
}
