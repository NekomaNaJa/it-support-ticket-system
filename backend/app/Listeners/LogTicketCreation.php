<?php

namespace App\Listeners;

use App\Events\TicketCreated; // <-- (1. มันรู้ว่าต้องฟัง Event นี้)
use App\Models\AuditLog;     // <-- (2. Import AuditLog)
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogTicketCreation
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event. (นี่คือ "สมอง" ครับ)
     */
    public function handle(TicketCreated $event): void
    {
        // (3. เมื่อ Event เกิดขึ้น, เราจะ "แกะ" Ticket ออกมา)
        $ticket = $event->ticket;

        // (4. สร้าง AuditLog!)
        AuditLog::create([
            // (ใช้ 'user_id' ของ "คนที่สร้าง" Ticket)
            'user_id' => $ticket->user_id, 
            'action' => 'created_ticket', // (สิ่งที่เราจะบันทึก)
            'description' => "User created a new ticket: '{$ticket->title}'",

            // (นี่คือ Polymorphic Relationship ที่เราสร้างไว้)
            'entity_type' => Ticket::class, // (ชื่อ Model แม่: "App\Models\Ticket")
            'entity_id' => $ticket->ticket_id // (ID ของแม่)
        ]);
    }
}