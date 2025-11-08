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
        Schema::table('attachments', function (Blueprint $table) {
            // 1. (สำคัญ!) ลบคอลัมน์ ticket_id (และ Foreign Key) เก่าทิ้ง
            $table->dropForeign(['ticket_id']);
            $table->dropColumn('ticket_id');

            // 2. เพิ่ม 2 คอลัมน์ใหม่สำหรับ Polymorphic
            // (attachable_id จะเก็บ 1, 2, 3...)
            // (attachable_type จะเก็บ "App\Models\Ticket" หรือ "App\Models\KnowledgeBase")
            $table->unsignedBigInteger('attachable_id');
            $table->string('attachable_type');

            // 3. (ทางเลือก) สร้าง Index เพื่อความเร็ว
            $table->index(['attachable_id', 'attachable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            // 1. ลบคอลัมน์ Polymorphic
            $table->dropIndex(['attachable_id', 'attachable_type']);
            $table->dropColumn('attachable_id');
            $table->dropColumn('attachable_type');

            // 2. สร้าง ticket_id กลับมา (เหมือนเดิม)
            $table->foreignId('ticket_id')->constrained('tickets', 'ticket_id')->onDelete('cascade');
        });
    }
};
