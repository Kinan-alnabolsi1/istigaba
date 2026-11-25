<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
| Native PostgreSQL ENUMs, values and order exactly as in docs/erd_v1.1.dbml.
*/
return new class extends Migration
{
    /** @var array<string, list<string>> */
    private array $types = [
        'report_status' => ['received', 'under_review', 'assigned', 'en_route', 'on_site', 'mission_completed', 'closed'],
        'mission_status' => ['assigned', 'en_route', 'on_site', 'mission_completed', 'cancelled'],
        'severity_level' => ['low', 'medium', 'high', 'critical'],
        'report_source' => ['sos', 'manual', 'ai_bot'],
        'input_mode' => ['text', 'voice'],
        'extraction_status' => ['pending_review', 'edited', 'confirmed', 'cancelled'],
        'notification_type' => ['status_update', 'assignment', 'closure', 'geographic_alert'],
        'unit_availability' => ['available', 'busy', 'offline'],
    ];

    public function up(): void
    {
        foreach ($this->types as $name => $values) {
            $list = implode(', ', array_map(fn (string $v) => "'{$v}'", $values));
            DB::statement("CREATE TYPE {$name} AS ENUM ({$list})");
        }
    }

    public function down(): void
    {
        foreach (array_reverse(array_keys($this->types)) as $name) {
            DB::statement("DROP TYPE IF EXISTS {$name}");
        }
    }
};
