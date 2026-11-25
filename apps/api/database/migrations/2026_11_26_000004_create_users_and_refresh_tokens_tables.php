<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 1: users, refresh_tokens.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->integer('role_id');
            $table->integer('field_unit_id')->nullable();
            $table->string('full_name', 150);
            $table->string('email', 255)->unique();
            $table->string('phone', 30)->nullable()->unique();
            $table->string('password_hash', 255);
            $table->boolean('is_active')->default(true);
            $table->geography('last_known_location', subtype: 'point', srid: 4326)->nullable();
            $table->timestampTz('location_updated_at')->nullable();
            $table->boolean('location_consent')->default(false);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->nullable();

            $table->foreign('role_id')->references('id')->on('roles');
            $table->foreign('field_unit_id')->references('id')->on('field_units');
            $table->index('role_id');
            $table->index('field_unit_id');
        });

        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(new Expression('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->string('token_hash', 255)->unique();
            $table->timestampTz('expires_at');
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
        Schema::dropIfExists('users');
    }
};
