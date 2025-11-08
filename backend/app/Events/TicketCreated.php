<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // --- ( 2. เพิ่มบรรทัดนี้ ) ---
    // (สร้าง "กระเป๋า" สาธารณะสำหรับเก็บ Ticket)
    public $ticket;
    // -------------------------

    /**
     * Create a new event instance.
     */
    // --- ( 3. แก้ไข constructor ) ---
    // (บังคับว่าใครก็ตามที่ "ตะโกน" Event นี้ ต้อง "ส่ง" Ticket มาด้วย)
    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }
    // -----------------------------
}