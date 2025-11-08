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
        Schema::create('attachments', function (Blueprint $table) {
            $table->id('attachment_id'); //
            $table->string('file_name', 255); //
            $table->string('file_path', 255); //
            $table->integer('size')->nullable(); // (หน่วยเป็น KB)
            $table->string('attachmentcol', 255)->nullable(); // (เก็บ MIME Type)
            
            $table->foreignId('ticket_id')
                  ->constrained('tickets', 'ticket_id') //
                  ->onDelete('cascade');

            $table->timestamp('uploaded_at')->nullable(); //
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};