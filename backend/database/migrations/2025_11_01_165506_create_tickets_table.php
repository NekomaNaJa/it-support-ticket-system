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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id('ticket_id'); //
            $table->string('title', 255); //
            $table->text('description'); //
            $table->enum('priority', ['low', 'medium', 'high', 'critical']); // 
            $table->integer('sla_hours')->nullable(); //
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open'); //

            // Foreign Keys
            $table->foreignId('user_id')
                  ->constrained('users', 'user_id') 
                  ->onDelete('cascade');

            $table->foreignId('category_id')
                  ->constrained('categories', 'category_id') 
                  ->onDelete('restrict');

            $table->foreignId('agent_id')
                  ->nullable()
                  ->constrained('users', 'user_id');

            $table->timestamps(); // (มี created_at, updated_at) 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};