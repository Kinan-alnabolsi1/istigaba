<?php

namespace App\Modules\Audit\DTOs;

/**
 * One audit entry. `oldValue`/`newValue` must never contain passwords, tokens, phone numbers or a
 * revealed identity (H4, H6); callers pass field names or codes instead of personal values.
 */
final readonly class AuditEntryData
{
    /**
     * @param  array<string, mixed>|null  $oldValue
     * @param  array<string, mixed>|null  $newValue
     */
    public function __construct(
        public string $action,
        public string $entityType,
        public ?string $entityId = null,
        public ?string $actorId = null,
        public ?array $oldValue = null,
        public ?array $newValue = null,
        public ?string $reason = null,
        public ?string $ipAddress = null,
    ) {}
}
