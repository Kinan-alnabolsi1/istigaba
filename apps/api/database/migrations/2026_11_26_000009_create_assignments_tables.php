<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 5: assignments, field_actions (FR-021, FR-026, FR-031..FR-033).
| One active (non-cancelled) assignment per report: partial unique index, which DBML cannot
| express (ERD explanation, STATE_TRANSITIONS.md §2). A violation is translated to 409 by the app.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('report_id');
            $table->integer('field_unit_id');
            $table->uuid('assigned_by');
            $table->rawColumn('mission_status', 'mission_status')->default('assigned');
            $table->timestampTz('assigned_at')->useCurrent();
            $table->timestampTz('en_route_at')->nullable();
            $table->timestampTz('on_site_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('cancelled_at')->nullable();

            $table->foreign('report_id')->references('id')->on('reports');
            $table->foreign('field_unit_id')->references('id')->on('field_units');
            $table->foreign('assigned_by')->references('id')->on('users');
            $table->index('report_id');
            $table->index(['field_unit_id', 'mission_status']);
        });

        DB::statement(
            'CREATE UNIQUE INDEX assignments_one_active_per_report ON assignments (report_id) '
            ."WHERE mission_status <> 'cancelled'"
        );

        Schema::create('field_actions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('assignment_id');
            $table->uuid('submitted_by');
            $table->text('action_taken');
            $table->string('attachment_url', 500)->nullable();
            $table->timestampTz('submitted_at')->useCurrent();

            $table->foreign('assignment_id')->references('id')->on('assignments');
            $table->foreign('submitted_by')->references('id')->on('users');
            $table->index('assignment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_actions');
        Schema::dropIfExists('assignments');
    }
};
