<?php

namespace App\Modules\Identity\DTOs;

/** Only the fields present in the PATCH body (`phone` may be explicitly null). */
final readonly class ProfileUpdateData
{
    /** @param array{full_name?: string, email?: string, phone?: string|null} $changes */
    public function __construct(public array $changes) {}
}
