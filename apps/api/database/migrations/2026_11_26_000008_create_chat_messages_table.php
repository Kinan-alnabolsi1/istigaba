<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
| DBML section 4: chat_messages (FR-025).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('report_id');
            $table->uuid('sender_id');
            $table->text('message');
            $table->timestampTz('sent_at')->useCurrent();

            $table->foreign('report_id')->references('id')->on('reports');
            $table->foreign('sender_id')->references('id')->on('users');
            $table->index(['report_id', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
