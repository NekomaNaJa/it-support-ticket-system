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
        Schema::create('comments', function (Blueprint $table) {
            $table->id('comment_id'); //
            $table->text('message'); // 

            // Foreign Keys
            $table->foreignId('ticket_id')
                  ->constrained('tickets', 'ticket_id') // 
                  ->onDelete('cascade');

            $table->foreignId('user_id')
                  ->constrained('users', 'user_id') // 
                  ->onDelete('cascade');

            $table->timestamps(); // (มี created_at) 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};