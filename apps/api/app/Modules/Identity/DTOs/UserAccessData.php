<?php

namespace App\Modules\Identity\DTOs;

/** What the authorization middleware needs about the caller, loaded once per request. */
final readonly class UserAccessData
{
    /** @param list<string> $permissions */
    public function __construct(
        public string $userId,
        public string $role,
        public array $permissions,
        public bool $isActive,
    ) {}

    public function can(string $permission): bool
    {
        return in_array($permission, $this->permissions, true);
    }
}
