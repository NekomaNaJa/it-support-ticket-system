<?php
namespace App\Listeners;

use App\Events\TicketDeleted; // (1. ฟัง Event นี้)
use App\Models\AuditLog;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogTicketDeletion
{
    /**
     * Handle the event.
     */
    public function handle(TicketDeleted $event): void
    {
        $ticket = $event->ticket;
        $user = $event->user;

        // (2. สร้าง AuditLog)
        AuditLog::create([
            'user_id' => $user->user_id, 
            'action' => 'deleted_ticket', // (Action ใหม่)
            'description' => "User '{$user->name}' deleted Ticket #{$ticket->ticket_id} ('{$ticket->title}').",

            // (เรายังคงอ้างอิง "ซาก" ของ Ticket ได้
            // เพราะเรา dispatch event "ก่อน" ที่มันจะถูกลบจริง)
            'entity_type' => Ticket::class,
            'entity_id' => $ticket->ticket_id
        ]);
    }
}