<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
| PostGIS is created by a superuser in scripts/db/setup-local.sh (it is not a trusted extension).
| This is a no-op once it exists, and fails loudly if it is missing.
| gen_random_uuid() is built into PostgreSQL 13+, so no pgcrypto is needed.
*/
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
    }

    public function down(): void
    {
        // Never drop PostGIS from a migration: other objects may depend on it.
    }
};
