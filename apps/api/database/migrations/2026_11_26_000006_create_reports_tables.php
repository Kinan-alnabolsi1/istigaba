<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 2: reports, report_timeline, report_attachments.
| reports.reporter_id is always stored, even for anonymous reports (H1: anonymity is projection, never nulling).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('reporter_id');
            $table->integer('report_type_id');
            $table->rawColumn('source', 'report_source');
            $table->boolean('is_anonymous')->default(false);
            $table->text('description')->nullable();
            $table->geography('location', subtype: 'point', srid: 4326)->nullable();
            $table->string('location_text', 255)->nullable();
            $table->rawColumn('severity', 'severity_level')->nullable();
            $table->decimal('priority_score', 6, 2)->nullable();
            $table->rawColumn('current_status', 'report_status')->default('received');
            $table->string('administrative_area', 100)->nullable();
            $table->text('close_reason')->nullable();
            $table->uuid('closed_by')->nullable();
            $table->timestampTz('closed_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->nullable();

            $table->foreign('reporter_id')->references('id')->on('users');
            $table->foreign('report_type_id')->references('id')->on('report_types');
            $table->foreign('closed_by')->references('id')->on('users');
            $table->index('current_status');
            $table->index('created_at');
            $table->index('reporter_id');
            $table->index('administrative_area');
            $table->index('report_type_id');
        });

        Schema::create('report_timeline', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('report_id');
            $table->rawColumn('status', 'report_status');
            $table->uuid('changed_by')->nullable();
            $table->text('note')->nullable();
            $table->timestampTz('changed_at')->useCurrent();

            $table->foreign('report_id')->references('id')->on('reports');
            $table->foreign('changed_by')->references('id')->on('users');
            $table->index(['report_id', 'changed_at']);
        });

        Schema::create('report_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('report_id');
            $table->string('file_url', 500);
            $table->string('file_type', 20);
            $table->string('mime_type', 100)->nullable();
            $table->bigInteger('size_bytes')->nullable();
            $table->timestampTz('uploaded_at')->useCurrent();

            $table->foreign('report_id')->references('id')->on('reports');
            $table->index('report_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_attachments');
        Schema::dropIfExists('report_timeline');
        Schema::dropIfExists('reports');
    }
};
