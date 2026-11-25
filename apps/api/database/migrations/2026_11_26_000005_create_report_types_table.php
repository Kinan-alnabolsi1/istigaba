<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 2: report_types (FR-008), unique (category, name).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_types', function (Blueprint $table) {
            $table->increments('id');
            $table->string('category', 50);
            $table->string('name', 100);
            $table->string('responsible_authority', 100);

            $table->unique(['category', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_types');
    }
};
