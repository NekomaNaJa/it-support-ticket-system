<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;

class CategoryController extends Controller
{
    /**
     * (อัปเกรดแล้ว - Role-Aware)
     * ดึงข้อมูล Categories (สำหรับ "ทุกคน")
     * (GET /api/categories)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // --- (นี่คือ Logic ใหม่) ---
        if ($user && ($user->role === 'staff' || $user->role === 'admin')) {

            // 1. ถ้าเป็น Staff/Admin: โหลด Categories (พร้อม "นับ" จำนวน Ticket)
            // (นี่คือ Logic จาก 'Admin/CategoryController' ที่เราย้ายมา)
            $allCategories = Category::withCount('tickets')
                                    ->orderBy('category_id')
                                    ->get();

            // (คำนวณ Stats - สำหรับหน้า Admin Management)
            $stats = [
                'total_categories' => $allCategories->count(),
                'total_tickets' => Ticket::count(),
            ];

            return response()->json([
                'categories' => $allCategories,
                'stats' => $stats,
            ]);

        } else {

            // 2. ถ้าเป็น User ธรรมดา: โหลด "เฉพาะ" รายชื่อ Category
            // (สำหรับ Dropdown ในหน้า Create/Edit Ticket)
            $categories = Category::all();
            return response()->json($categories);
        }
        // --- (จบ Logic ใหม่) ---
    }

    /**
     * ดึงข้อมูล Category 1 อัน (สำหรับหน้า Edit)
     * (GET /api/categories/{id})
     */
    public function show(string $id)
    {
        $user = Auth::user();
        // (Security) ต้องเป็น Staff/Admin เท่านั้น
        if (!$user || (strtolower($user->role) !== 'admin' && strtolower($user->role) !== 'staff')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $category = Category::findOrFail($id);
            return response()->json($category);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Category not found.'], 404);
        }
    }

    /**
     * สร้าง Category ใหม่
     * (POST /api/categories)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        // (Security) ต้องเป็น Admin เท่านั้น
        if (strtolower($user->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 1. ตรวจสอบข้อมูล (Validation)
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories') // (ชื่อ Category ต้องไม่ซ้ำ)
            ],
            'description' => 'nullable|string',
        ]);

        // 2. สร้าง Category
        $category = Category::create($validated);

        // 3. (สำคัญ!) โหลด 'tickets_count' กลับไป (เพื่อให้ UI อัปเดตได้ทันที)
        // (นี่คือการทำให้แน่ใจว่าแถวใหม่ที่เพิ่มในตารางจะมีเลข 0)
        $category->loadCount('tickets');

        return response()->json($category, 201); // 201 = Created
    }

    /**
     * อัปเดตข้อมูล Category
     * (PUT /api/categories/{id})
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        // (Security) ต้องเป็น Admin เท่านั้น
        if (strtolower($user->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $categoryToUpdate = Category::findOrFail($id);

            // 1. (สำคัญ!) ตรวจสอบข้อมูล (Validation)
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    // (เช็ก 'name' ว่า "ไม่ซ้ำ" ...
                    // ... โดย "ยกเว้น" (ignore) category_id ของอันนี้)
                    Rule::unique('categories')->ignore($categoryToUpdate->category_id, 'category_id')
                ],
                'description' => 'nullable|string',
            ]);

            // 2. อัปเดตข้อมูล
            $categoryToUpdate->update($validated);

            return response()->json($categoryToUpdate);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Category not found.'], 404);
        }
    }

    public function destroy(string $id)
    {
        $user = Auth::user();
        // (Security) ต้องเป็น Admin เท่านั้น
        if (strtolower($user->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $categoryToDelete = Category::findOrFail($id);

            // (สำคัญ!) พยายามลบ
            // onDelete('restrict') ใน migration (tickets, kb)
            // จะทำงานที่นี่และโยน QueryException ถ้า Category ถูกใช้งานอยู่
            $categoryToDelete->delete();

            // (ถ้าลบสำเร็จ)
            return response()->noContent(); 

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Category not found.'], 404);

        } catch (QueryException $e) {
            // (นี่คือ "Bug" ที่เราดักไว้)
            // เช็กว่า Error code คือ 1451 (Foreign Key Constraint Violation)
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    'message' => 'Cannot delete this category. It is currently in use by one or more tickets or knowledge base articles.'
                ], 409); // 409 = Conflict (ข้อมูลขัดแย้ง)
            }

            // ถ้าเป็น Error อื่น
            return response()->json(['message' => 'Database error occurred.'], 500);
        }
    }
}