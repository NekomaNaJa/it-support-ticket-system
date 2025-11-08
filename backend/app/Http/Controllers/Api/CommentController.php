<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * บันทึกคอมเมนต์ใหม่ลงใน Ticket
     */
    public function store(Request $request)
    {
        // 1. ตรวจสอบข้อมูล
        $validated = $request->validate([
            'ticket_id' => 'required|integer|exists:tickets,ticket_id',
            'message' => 'required|string|min:1',
            // (ในอนาคต เราจะเพิ่มการ validate ไฟล์แนบที่นี่)
        ]);

        // 2. ตรวจสอบว่า Ticket มีอยู่จริง (เผื่อไว้)
        $ticket = Ticket::findOrFail($validated['ticket_id']);

        // (ในระบบจริง เราควรเช็กสิทธิ์อีกชั้นว่า user นี้มีสิทธิ์คอมเมนต์ใน ticket นี้หรือไม่)
        // (แต่ตอนนี้ เราอนุญาตให้ User ที่ login อยู่คอมเมนต์ได้เลย)

        // 3. สร้าง Comment
        $comment = Comment::create([
            'ticket_id' => $ticket->ticket_id,
            'user_id' => Auth::id(), // เอา user_id จากคนที่ login อยู่
            'message' => $validated['message'],
        ]);

        // 4. (สำคัญมาก!) โหลด relationship 'user' มาด้วย
        // เพื่อให้ React มีข้อมูล user (ชื่อ, email) ของคอมเมนต์ใหม่นี้ทันที
        $comment->load('user');

        // 5. ส่งข้อมูลคอมเมนต์ใหม่ (พร้อมข้อมูล user) กลับไป
        return response()->json($comment, 201); // 201 = Created
    }
}