<?php

namespace App\Modules\Identity\DTOs;

final readonly class RegisterCitizenData
{
    public function __construct(
        public string $fullName,
        public string $email,
        public string $phone,
        public string $password,
    ) {}
}
