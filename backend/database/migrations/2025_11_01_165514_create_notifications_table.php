<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notif_id'); //
            $table->string('message', 255); //
            $table->tinyInteger('is_read')->default(0); //
            
            $table->foreignId('user_id')
                  ->constrained('users', 'user_id') //
                  ->onDelete('cascade');

            $table->timestamp('created_at')->nullable(); //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};