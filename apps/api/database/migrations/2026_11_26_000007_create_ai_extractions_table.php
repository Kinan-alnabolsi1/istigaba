<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 3: ai_extractions (FR-013..FR-018). No audio column: recordings are deleted after
| transcription (H2). report_id is set only after explicit citizen confirmation (H5).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_extractions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->uuid('report_id')->nullable()->unique();
            $table->rawColumn('input_mode', 'input_mode');
            $table->text('input_text')->nullable();
            $table->integer('extracted_type_id')->nullable();
            $table->rawColumn('extracted_severity', 'severity_level')->nullable();
            $table->string('extracted_location_text', 255)->nullable();
            $table->text('extracted_description')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->rawColumn('status', 'extraction_status')->default('pending_review');
            $table->timestampTz('confirmed_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('report_id')->references('id')->on('reports');
            $table->foreign('extracted_type_id')->references('id')->on('report_types');
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_extractions');
    }
};
