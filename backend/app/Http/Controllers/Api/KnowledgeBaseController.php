<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeBase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use App\Models\Attachment;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class KnowledgeBaseController extends Controller
{
    /**
     * ดึงรายการ Knowledge Base ทั้งหมด
     * (GET /api/knowledge-base)
     */
    public function index()
    {
        $articles = KnowledgeBase::with(['category', 'user', 'attachments'])
                                ->orderBy('created_at', 'desc')
                                ->get();

        return response()->json($articles);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'staff' && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 1. (แก้ไข) เพิ่ม 'attachment' ใน Validation
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'category_id' => 'required|integer|exists:categories,category_id',
            'attachment' => 'nullable|file|image|max:51200', // (50MB max)
        ]);

        // 2. สร้าง Article
        $article = KnowledgeBase::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category_id' => $validated['category_id'],
            'user_id' => $user->user_id,
        ]);

        // 3. (เพิ่ม) Logic การบันทึกไฟล์ (ถ้ามี)
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            // (เราจะใช้ Polymorphic Relationship ที่เราสร้างไว้!)
            // (บันทึกไฟล์ไปที่ 'public' disk)
            $path = $file->store('attachments/knowledge_base/' . $article->article_id, 'public');

            // (สร้าง Attachment record)
            $article->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => Storage::url($path), // (ใช้ Storage::url เพื่อให้ได้ /storage/...)
                'size' => $file->getSize(),
                'attachmentcol' => $file->getMimeType(),
                // 'attachable_id' & 'attachable_type' จะถูกใส่ให้เอง!
            ]);
        }

        // 4. โหลดข้อมูลกลับไป (รวม attachments ด้วย)
        $article->load('category', 'attachments');
        return response()->json($article, 201);
    }

    public function show(string $id)
    {
        try {
            // (เราจะโหลด relations ทั้งหมดที่หน้า Edit/Detail ต้องการ)
            $article = KnowledgeBase::with(['category', 'user', 'attachments'])
                                ->findOrFail($id);

            return response()->json($article);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Article not found.'], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        $user = $request->user();

        // (Security) ต้องเป็น Staff/Admin เท่านั้น
        if ($user->role !== 'staff' && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $article = KnowledgeBase::findOrFail($id);

            // (Validation เหมือนตอน store แต่ไม่เช็กไฟล์)
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string|min:10',
                'category_id' => 'required|integer|exists:categories,category_id',
            ]);

            // (อัปเดตเฉพาะ "ข้อความ")
            $article->update($validated);

            // โหลดข้อมูลล่าสุดกลับไป
            $article->load('category', 'user', 'attachments');
            return response()->json($article);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Article not found.'], 404);
        }
    }

}