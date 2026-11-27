<?php

namespace App\Modules\Identity\DTOs;

use Carbon\CarbonImmutable;

/** The caller's own profile (contract `CurrentUser`). Own data only; never a location or hash. */
final readonly class CurrentUserData
{
    /**
     * @param  array{id: int, name: string, unit_type: string}|null  $fieldUnit
     * @param  list<string>  $permissions  sorted permission codes of the role
     */
    public function __construct(
        public string $id,
        public string $fullName,
        public string $email,
        public ?string $phone,
        public string $role,
        public ?array $fieldUnit,
        public array $permissions,
        public bool $isActive,
        public bool $locationConsent,
        public ?CarbonImmutable $locationUpdatedAt,
    ) {}
}
