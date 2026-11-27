<?php

namespace App\Modules\Identity\DTOs;

final readonly class RoleData
{
    /** @param list<PermissionData> $permissions */
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public array $permissions,
    ) {}
}
