<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * (ฟังก์ชันใหม่)
     * ดึงข้อมูล Dashboard Stats สำหรับ Admin
     * (GET /api/admin/dashboard-stats)
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        // 1. (Security) ต้องเป็น Admin เท่านั้น
        if (strtolower($user->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 2. (Query) ดึงข้อมูล Stats "ตาม Status" (สำหรับ Stat Cards & Pie Chart)
        // (เราใช้ DB::raw('count(*)') เพื่อ "นับ" และ groupBy('status'))
        $statusStats = Ticket::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status'); // ->pluck จะสร้าง: [ 'open' => 2, 'in_progress' => 2, ... ]

        // 3. (Query) ดึงข้อมูล Stats "ตาม Priority" (สำหรับ Bar Chart)
        $priorityStats = Ticket::query()
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority'); // -> [ 'low' => 2, 'medium' => 2, ... ]


        // 4. (TODO) คำนวณ "Past SLA"
        // (Logic นี้ซับซ้อน - เราจะเว้นไว้ก่อน)
        $pastSlaCount = 0; // (ตัวเลขสมมติ)


        // 5. "ประกอบร่าง" ข้อมูลที่จะส่งกลับไป
        return response()->json([
            'status_stats' => [
                'total' => $statusStats->sum(),
                'open' => $statusStats->get('open', 0),
                'in_progress' => $statusStats->get('in_progress', 0),
                'resolved' => $statusStats->get('resolved', 0),
                'closed' => $statusStats->get('closed', 0),
                'past_sla' => $pastSlaCount // (ส่ง ? ไปก่อน)
            ],
            'priority_stats' => $priorityStats,
        ]);
    }
}