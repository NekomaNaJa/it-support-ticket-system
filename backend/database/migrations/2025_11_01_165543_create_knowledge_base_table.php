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
        Schema::create('knowledge_base', function (Blueprint $table) {
            $table->id('article_id');
            $table->string('title', 255);
            $table->text('content');
            $table->text('description')->nullable();
            
            $table->foreignId('user_id') // คนเขียน
                  ->nullable() // <-- นี่คือส่วนที่เพิ่มเข้ามาแก้ไข
                  ->constrained('users', 'user_id')
                  ->onDelete('set null');

            $table->foreignId('category_id') // หมวดหมู่
                  ->nullable() // <-- นี่คือส่วนที่เพิ่มเข้ามาแก้ไข
                  ->constrained('categories', 'category_id')
                  ->onDelete('set null');

            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base');
    }
};