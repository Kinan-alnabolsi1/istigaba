<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 7: audit_logs, system_settings, simulated_integration_logs
| (FR-034..FR-037, FR-039, NFR-010). Audit logs are append-only and permanent (H4).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('actor_id')->nullable();
            $table->string('action', 100);
            $table->string('entity_type', 50);
            $table->string('entity_id', 64)->nullable();
            $table->jsonb('old_value')->nullable();
            $table->jsonb('new_value')->nullable();
            $table->text('reason')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('actor_id')->references('id')->on('users');
            $table->index('actor_id');
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
            $table->index('created_at');
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('key', 100)->primary();
            $table->text('value');
            $table->string('description', 255)->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('updated_by')->references('id')->on('users');
        });

        Schema::create('simulated_integration_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('assignment_id');
            $table->string('authority', 100);
            $table->jsonb('request_payload')->nullable();
            $table->jsonb('response_payload')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('assignment_id')->references('id')->on('assignments');
            $table->index('assignment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulated_integration_logs');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('audit_logs');
    }
};
