<?php

namespace App\Modules\Audit\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Append-only audit row (DBML `audit_logs`, H4, NFR-010). Written only through
 * RecordAuditEntryAction; there is no update or delete path anywhere in the application.
 *
 * @property int $id
 * @property string|null $actor_id
 * @property string $action
 * @property string $entity_type
 * @property string|null $entity_id
 * @property array<string, mixed>|null $old_value
 * @property array<string, mixed>|null $new_value
 * @property string|null $reason
 * @property string|null $ip_address
 */
final class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'audit_logs';

    protected $fillable = ['actor_id', 'action', 'entity_type', 'entity_id', 'old_value', 'new_value', 'reason', 'ip_address'];

    protected function casts(): array
    {
        return [
            'old_value' => 'array',
            'new_value' => 'array',
            'created_at' => 'immutable_datetime',
        ];
    }
}
