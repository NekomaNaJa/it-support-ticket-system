<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UserController extends Controller
{
    /**
     * (ฟังก์ชันใหม่)
     * ดึงข้อมูล Dashboard (Users & Stats) สำหรับ Admin
     * (GET /api/admin/users)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. (Security) ต้องเป็น Admin เท่านั้น
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 2. ดึงข้อมูล User ทั้งหมด (เรียงตาม ID)
        $allUsers = User::orderBy('user_id')->get();

        // 3. คำนวณ Stats (ตาม Wireframe 'image_83d7ba.png')
        $stats = [
            'total' => $allUsers->count(),
            'admin' => $allUsers->where('role', 'admin')->count(),
            'staff' => $allUsers->where('role', 'staff')->count(),
            'user' => $allUsers->where('role', 'user')->count(),
        ];

        // 4. ส่งข้อมูลทั้ง 2 ส่วนกลับไป
        return response()->json([
            'users' => $allUsers,
            'stats' => $stats,
        ]);
    }

    /**
    * ดึงข้อมูล User 1 คน (สำหรับหน้า Edit)
    * (GET /api/admin/users/{id})
    */
    public function show(string $id)
    {
        $adminUser = Auth::user();
        if (strtolower($adminUser->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $user = User::findOrFail($id);
            return response()->json($user);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    }

    /**
     * อัปเดตข้อมูล User
     * (PUT /api/admin/users/{id})
     */
    public function update(Request $request, string $id)
    {
        $adminUser = Auth::user();
        if (strtolower($adminUser->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $userToUpdate = User::findOrFail($id);

            // 1. (สำคัญ!) ตรวจสอบข้อมูล (Validation)
            $validated = $request->validate([
                'name' => 'required|string|max:255',

                // (เช็ก 'email' ว่า "ไม่ซ้ำ" ...
                // ... โดย "ยกเว้น" (ignore) user_id ของคนนี้)
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users')->ignore($userToUpdate->user_id, 'user_id')
                ],

                // (ต้องเป็น Role ที่เราอนุญาตเท่านั้น)
                'role' => ['required', 'string', Rule::in(['admin', 'staff', 'user'])],

                // (TODO: เพิ่ม 'status' ถ้าคุณมีใน DB)
                // 'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
            ]);

            // 2. อัปเดตข้อมูล
            $userToUpdate->update($validated);

            return response()->json($userToUpdate);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    }

    /**
     * ลบ User
     * (DELETE /api/admin/users/{id})
     */
    public function destroy(string $id)
    {
        $adminUser = Auth::user();

        // 1. (Security) ต้องเป็น Admin เท่านั้น
        if (strtolower($adminUser->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 2. (Security 2) Admin "ห้าม" ลบตัวเอง
        if ($adminUser->user_id == $id) {
            return response()->json(['message' => 'Admins cannot delete their own account.'], 403); // 403 = Forbidden
        }

        try {
            // 3. ค้นหา User ที่จะลบ
            $userToDelete = User::with(['tickets', 'comments', 'knowledgeBaseArticles'])->findOrFail($id);

            // 4. (สำคัญ!) ลบ "สิ่งที่เกี่ยวข้อง" (Dependencies) ทั้งหมดก่อน
            // (เพราะ Foreign Key ของเราไม่ได้ตั้ง 'onDelete(cascade)' ไว้ทุกจุด)

            $userToDelete->knowledgeBaseArticles()->delete(); // ลบบทความ
            $userToDelete->comments()->delete(); // ลบคอมเมนต์

            // (เราต้องลบ Ticket ของเขา, ซึ่งจะไป "Cascade" ลบ Attachments/Comments ของ Ticket นั้นๆ)
            $userToDelete->tickets()->delete(); 

            // 5. (เมื่อปลอดภัยแล้ว) ลบ User
            $userToDelete->delete();

            // 6. ส่ง 204 No Content (แปลว่า "ลบสำเร็จ")
            return response()->noContent(); 

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    }
}