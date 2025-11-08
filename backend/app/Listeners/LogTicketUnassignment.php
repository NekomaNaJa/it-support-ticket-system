<?php
namespace App\Listeners;

use App\Events\TicketUnassigned;
use App\Models\AuditLog;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogTicketUnassignment
{
    /**
     * Handle the event.
     */
    public function handle(TicketUnassigned $event): void
    {
        $ticket = $event->ticket;
        $user = $event->user; // (Staff ที่ปล่อยงาน)

        // (2. สร้าง AuditLog)
        AuditLog::create([
            'user_id' => $user->user_id, 
            'action' => 'unassigned_ticket', // (Action ใหม่)
            'description' => "Staff '{$user->name}' unassigned Ticket #{$ticket->ticket_id} from themselves.",
            'entity_type' => Ticket::class,
            'entity_id' => $ticket->ticket_id
        ]);
    }
}