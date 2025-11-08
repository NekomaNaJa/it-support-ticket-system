<?php

namespace App\Listeners;

use App\Events\TicketAssigned;
use App\Models\AuditLog;  
use App\Models\Ticket;    
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogTicketAssignment
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
    public function handle(TicketAssigned $event): void
    {
        // (4. แกะข้อมูลออกจาก "กระเป๋า")
        $ticket = $event->ticket;
        $user = $event->user; // (นี่คือ Staff ที่กดรับงาน)

        // (5. สร้าง AuditLog!)
        AuditLog::create([
            // (User ที่ "กระทำ" คือ Staff)
            'user_id' => $user->user_id, 
            'action' => 'assigned_ticket',
            'description' => "Staff '{$user->name}' assigned Ticket #{$ticket->ticket_id} to themselves.",

            // (สิ่งที่ "ถูกกระทำ" คือ Ticket)
            'entity_type' => Ticket::class,
            'entity_id' => $ticket->ticket_id
        ]);
    }
}