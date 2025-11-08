<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Attachment; 
use App\Events\TicketCreated;
use App\Events\TicketAssigned;
use App\Events\TicketUnassigned;
use App\Events\TicketStatusUpdated;
use App\Events\TicketDeleted;
use Illuminate\Support\Facades\Storage; 
use Illuminate\Database\Eloquent\ModelNotFoundException; 

class TicketController extends Controller
{
    // (ฟังก์ชัน index())
    public function index(Request $request)
    {
        $user = $request->user();

        // (กำหนด relations ที่เราต้องการโหลดเสมอ)
        $commonRelations = ['user', 'category', 'agent'];

        if ($user->role === 'staff' || $user->role === 'admin') {

            // 1. ถ้าเป็น Staff/Admin: โหลด Ticket "ทั้งหมด"
            $tickets = Ticket::with($commonRelations)
                            ->orderBy('created_at', 'desc')
                            ->get();

        } else {

            // 2. ถ้าเป็น User ธรรมดา: โหลด "เฉพาะ" Ticket ของตัวเอง
            $tickets = $user->tickets() 
                            ->with($commonRelations)
                            ->orderBy('created_at', 'desc')
                            ->get();
        }

        return response()->json($tickets);
    }

    /**
     * สร้าง Ticket ใหม่ (อัปเกรดให้รองรับไฟล์แนบ FR-05)
     * (POST /api/tickets)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'category_id' => 'required|integer|exists:categories,category_id',
            'attachment' => 'nullable|file|max:51200',
        ]);
        $ticket = $user->tickets()->create([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'priority' => $validatedData['priority'],
            'category_id' => $validatedData['category_id'],
            'status' => 'open',
        ]);

        TicketCreated::dispatch($ticket);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path_to_store = 'attachments/' . $ticket->ticket_id;
            $path = $file->store($path_to_store, 'public');
            
            // --- (นี่คือการแก้ไข) ---
            // เปลี่ยน 'mime_type' เป็น 'attachmentcol'
            $ticket->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => '/storage/' . $path, 
                'size' => $file->getSize(),
                'attachmentcol' => $file->getMimeType(), // <-- แก้ไขตรงนี้
            ]);
            // ------------------------
        }
        return response()->json($ticket->load('attachments'), 201);
    }
    
    // (ฟังก์ชัน show() เหมือนเดิม)
    public function show(Request $request, string $id)
{
    $user = $request->user();

    // (กำหนด relations ที่เราต้องการโหลด)
    $relations = ['user', 'category', 'agent', 'attachments', 'comments.user'];

    try {
        if ($user->role === 'staff' || $user->role === 'admin') {

            // 1. ถ้าเป็น Staff/Admin: ค้นหาจาก "Ticket ทั้งหมด"
            $ticket = Ticket::with($relations)->findOrFail($id);

        } else {

            // 2. ถ้าเป็น User ธรรมดา: ค้นหาจาก "Ticket ของตัวเอง"
            $ticket = $user->tickets()->with($relations)->findOrFail($id);

        }

        return response()->json($ticket);

    } catch (ModelNotFoundException $e) {

        // Catch นี้จะทำงานเมื่อ:
        // 1. ID นั้นไม่มีอยู่จริง (สำหรับ Staff)
        // 2. ID นั้นไม่มีอยู่จริง "หรือ" เป็นของคนอื่น (สำหรับ User)
        return response()->json([
            'message' => 'Ticket not found or you do not have permission to view it.'
        ], 404);
    }
}

    public function update(Request $request, string $id)
    {
        // 1. ดึงผู้ใช้ที่ login อยู่
        $user = $request->user();

        try {
            // 2. (สำคัญมาก!) ค้นหา Ticket จาก "เฉพาะ Ticket ที่ผู้ใช้นี้สร้าง" เท่านั้น
            // (นี่คือการยืนยันว่า User นี้เป็น "เจ้าของ" Ticket)
            $ticket = $user->tickets()->findOrFail($id);

            // 3. ตรวจสอบข้อมูล (Validation) (เหมือนตอน store)
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'priority' => [
                    'required',
                    Rule::in(['low', 'medium', 'high', 'critical']), // (อัปเดต priority ให้ครบ)
                ],
                'category_id' => 'required|integer|exists:categories,category_id',
            ]);

            // 4. (นี่คือส่วนที่ต่าง) อัปเดตข้อมูล Ticket นั้น
            $ticket->update($validatedData);

            // 5. (ทางเลือก) โหลดข้อมูล Category มาด้วย
            $ticket->load('category');

            // 6. ส่ง Ticket ที่อัปเดตแล้วกลับไป
            return response()->json($ticket);

        } catch (ModelNotFoundException $e) {
            // 4. ถ้าหาไม่เจอ (ไม่ใช่เจ้าของ หรือ ID ผิด)
            return response()->json([
                'message' => 'Ticket not found or you do not have permission to edit it.'
            ], 404);
        }
    }

    /**
     * ลบ Ticket
     * (DELETE /api/tickets/{id})
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        try {
            // 1. (Security Check!) ค้นหา Ticket จาก "เฉพาะ Ticket ที่ผู้ใช้นี้สร้าง" เท่านั้น
            // (เราโหลด 'attachments' มาด้วย เพื่อลบไฟล์ใน Storage)
            $ticket = $user->tickets()->with('attachments')->findOrFail($id);

            // 2. (สำคัญ!) ลบไฟล์จริงใน Storage ก่อน
            foreach ($ticket->attachments as $attachment) {
                // แปลง /storage/attachments/... เป็น attachments/...
                $filePath = str_replace(Storage::url(''), '', $attachment->file_path);
                Storage::disk('public')->delete($filePath);
            }

            TicketDeleted::dispatch($ticket, $user);
            $ticket->delete();

            // 4. ส่ง 204 No Content (แปลว่า "ลบสำเร็จ ไม่มีอะไรจะส่งกลับไป")
            return response()->noContent(); 

        } catch (ModelNotFoundException $e) {
            // 5. ถ้าหาไม่เจอ (ไม่ใช่เจ้าของ หรือ ID ผิด)
            return response()->json([
                'message' => 'Ticket not found or you do not have permission to delete it.'
            ], 404);
        }
    }

    public function assign(Request $request, string $id)
    {
        $user = $request->user();

        // 1. (Security) ต้องเป็น Staff เท่านั้น
        if ($user->role !== 'staff' && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $ticket = Ticket::findOrFail($id);

            // --- (2. นี่คือ Logic ใหม่ที่อัปเกรดแล้ว) ---
            if ($ticket->agent_id === null) {
                // --- กำลัง "รับ" (Take) งาน ---
                $ticket->agent_id = $user->user_id;

                // (เพิ่ม Logic นี้)
                // ถ้า Ticket ยัง "Open" อยู่ ให้เปลี่ยนเป็น "In Progress"
                if ($ticket->status === 'open') {
                    $ticket->status = 'in_progress';
                }

                $ticket->save();
            
                TicketAssigned::dispatch($ticket, $user);

            } else if ($ticket->agent_id === $user->user_id) {
                // --- กำลัง "ปล่อย" (Drop) งาน ---
                $ticket->agent_id = null;

                // (เพิ่ม Logic นี้)
                // ถ้า Ticket กำลัง "In Progress" ให้เปลี่ยนกลับเป็น "Open"
                if ($ticket->status === 'in_progress') {
                    $ticket->status = 'open';
                }

                $ticket->save();
                TicketUnassigned::dispatch($ticket, $user);

                } else {
                    // (ถ้า "คนอื่น" ถืออยู่: ห้ามยุ่ง!)
                    return response()->json(['message' => 'Ticket is already assigned to another agent.'], 403);
                }
            // --- (จบ Logic ใหม่) ---


            // 3. บันทึก (ทั้ง agent_id และ status)
            $ticket->save();

            // 4. โหลด relations ทั้งหมดที่หน้า Flow ต้องการ
            $ticket->load('user', 'category', 'agent', 'attachments', 'comments.user');

            // 5. ส่ง Ticket ที่อัปเดตแล้ว (ทั้ง 2 field) กลับไป
            return response()->json($ticket);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }
    }

    public function updateStatus(Request $request, string $id)
    {
        $user = $request->user();

        // 1. (Security) ต้องเป็น Staff เท่านั้น
        if ($user->role !== 'staff' && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // 2. (Validation) ตรวจสอบว่ามี "status" ส่งมา และถูกต้อง
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['open', 'in_progress', 'resolved', 'closed'])],
        ]);

        try {
            $ticket = Ticket::findOrFail($id);

            $oldStatus = $ticket->status; // (1. "จำ" สถานะเก่าไว้)
            $newStatus = $validated['status']; // (2. "จำ" สถานะใหม่ไว้)

            // (กันการ Spam Log: ถ้าสถานะไม่เปลี่ยน ก็ไม่ต้องทำอะไร)
            if ($oldStatus === $newStatus) {
                $ticket->load('user', 'category', 'agent', 'attachments', 'comments.user');
                return response()->json($ticket); // (ส่งข้อมูลเดิมกลับไปเฉยๆ)
            }

            $ticket->status = $newStatus;
            $ticket->save();

            $ticket->comments()->create([
                'message' => "เปลี่ยนสถานะจาก '{$oldStatus}' เป็น '{$newStatus}'",
                'user_id' => $user->user_id,
                'is_log' => true,
            ]);

            TicketStatusUpdated::dispatch($ticket, $user, $oldStatus, $newStatus);

            $ticket->load('user', 'category', 'agent', 'attachments', 'comments.user');
            return response()->json($ticket);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }
    }
}