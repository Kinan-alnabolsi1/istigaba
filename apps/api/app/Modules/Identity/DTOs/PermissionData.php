<?php

namespace App\Modules\Identity\DTOs;

final readonly class PermissionData
{
    public function __construct(
        public int $id,
        public string $code,
        public ?string $description,
    ) {}
}
