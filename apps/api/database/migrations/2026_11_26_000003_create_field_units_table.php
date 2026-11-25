<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 5: field_units. Created before users because users.field_unit_id references it.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('field_units', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 150);
            $table->string('unit_type', 50);
            $table->rawColumn('availability', 'unit_availability')->default('available');
            $table->geography('location', subtype: 'point', srid: 4326)->nullable();
            $table->timestampTz('location_updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_units');
    }
};
