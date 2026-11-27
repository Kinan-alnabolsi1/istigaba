<?php

namespace App\Modules\Audit\Actions;

use App\Modules\Audit\DTOs\AuditEntryData;
use App\Modules\Audit\Models\AuditLog;

/** Appends one audit row (H4). Runs inside the caller's transaction when there is one. */
final class RecordAuditEntryAction
{
    public function handle(AuditEntryData $entry): void
    {
        AuditLog::query()->create([
            'actor_id' => $entry->actorId,
            'action' => $entry->action,
            'entity_type' => $entry->entityType,
            'entity_id' => $entry->entityId,
            'old_value' => $entry->oldValue,
            'new_value' => $entry->newValue,
            'reason' => $entry->reason,
            'ip_address' => $entry->ipAddress,
        ]);
    }
}
