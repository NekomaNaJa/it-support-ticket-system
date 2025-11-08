<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Ticket;
use App\Models\KnowledgeBase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AttachmentController extends Controller
{
    /**
     * (อัปเกรดแล้ว - Polymorphic Store)
     * บันทึกไฟล์แนบ (สำหรับ Ticket หรือ KnowledgeBase)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. (Validation ใหม่ - ฉลาด)
        $validated = $request->validate([
            'attachment' => 'required|file|image|max:51200', // (50MB)
            'attachable_type' => ['required', 'string', Rule::in(['App\Models\Ticket', 'App\Models\KnowledgeBase'])],
            'attachable_id' => 'required|integer',
        ]);

        try {
            // 2. (Logic ใหม่) ค้นหา "Model แม่"
            $modelType = $validated['attachable_type']; // e.g., "App\Models\Ticket"
            $modelId = $validated['attachable_id'];     // e.g., 1

            $parentModel = new $modelType; // (สร้าง Instance ของ Class)
            $parent = $parentModel->findOrFail($modelId);

            // 3. (Security Check)
            if ($modelType === 'App\Models\Ticket' && $parent->user_id !== $user->user_id) {
                 return response()->json(['message' => 'Forbidden'], 403);
            }
            // (ถ้าเป็น KB, เราอนุญาตให้ Staff/Admin ทำได้ ซึ่ง Controller นี้ถูกล็อคโดย 'auth:sanctum' อยู่แล้ว)

            // 4. (Dynamic path)
            $folder = ($modelType === 'App\Models\Ticket') ? 'tickets' : 'knowledge_base';
            $path = $request->file('attachment')->store("attachments/{$folder}/{$parent->getKey()}", 'public');

            // 5. (Polymorphic Create)
            // (เราเรียก 'attachments()' ที่เราสร้างไว้ใน Model Ticket/KnowledgeBase)
            $attachment = $parent->attachments()->create([
                'file_name' => $request->file('attachment')->getClientOriginalName(),
                'file_path' => '/storage/' . $path, // (บันทึก Path ที่ถูกต้อง)
                'size' => $request->file('attachment')->getSize(),
                'attachmentcol' => $request->file('attachment')->getMimeType(),
            ]);

            return response()->json($attachment, 201);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Parent model not found.'], 404);
        }
    }


    /**
     * (อัปเกรดแล้ว - Polymorphic Destroy)
     * ลบไฟล์แนบ
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $attachment = Attachment::findOrFail($id);

        // 2. (Security Check - Polymorphic)
        $parent = $attachment->attachable; // <-- นี่คือ "Magic" ของ Polymorphic

        if (!$parent) {
            return response()->json(['message' => 'Parent not found'], 404);
        }

        // (เช็กว่า User เป็นเจ้าของ Ticket หรือไม่)
        if ($parent instanceof Ticket && $parent->user_id !== $user->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // (เช็กว่า User เป็น Staff หรือไม่ (สำหรับ KB))
        if ($parent instanceof KnowledgeBase && !$user->role == 'staff' && !$user->role === 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 3. ลบไฟล์ออกจาก Storage
        $filePath = str_replace('/storage/', '', $attachment->file_path);
        Storage::disk('public')->delete($filePath);

        // 4. ลบ Record ออกจากฐานข้อมูล
        $attachment->delete();
        return response()->noContent(); 
    }
}