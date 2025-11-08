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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->string('action', 255);
            $table->string('entity_type', 255);
            $table->unsignedBigInteger('entity_id');
            $table->text('description')->nullable();
            
            $table->foreignId('user_id')
                  ->nullable() // <-- นี่คือส่วนที่เพิ่มเข้ามาแก้ไข
                  ->constrained('users', 'user_id')
                  ->onDelete('set null'); // ตอนนี้คำสั่งนี้ถูกต้องแล้ว

            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};