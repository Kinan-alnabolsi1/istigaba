<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 6: geographic_alerts, notifications (FR-011, FR-012, FR-027, FR-038).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geographic_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('created_by');
            $table->string('title', 150);
            $table->text('hazard_description');
            $table->geography('center', subtype: 'point', srid: 4326);
            $table->integer('radius_m');
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('created_by')->references('id')->on('users');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->rawColumn('type', 'notification_type');
            $table->uuid('report_id')->nullable();
            $table->uuid('alert_id')->nullable();
            $table->string('title', 150);
            $table->text('body')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('report_id')->references('id')->on('reports');
            $table->foreign('alert_id')->references('id')->on('geographic_alerts');
            $table->index(['user_id', 'is_read']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('geographic_alerts');
    }
};
