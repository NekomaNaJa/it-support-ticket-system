<?php
namespace App\Listeners;

use App\Events\TicketStatusUpdated;
use App\Models\AuditLog;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogTicketStatusUpdate
{
    /**
     * Handle the event.
     */
    public function handle(TicketStatusUpdated $event): void
    {
        $ticket = $event->ticket;
        $user = $event->user;

        // (2. สร้าง AuditLog)
        AuditLog::create([
            'user_id' => $user->user_id, 
            'action' => 'updated_status', // (Action ใหม่)
            'description' => "Staff '{$user->name}' changed Ticket #{$ticket->ticket_id} status from '{$event->oldStatus}' to '{$event->newStatus}'.",
            'entity_type' => Ticket::class,
            'entity_id' => $ticket->ticket_id
        ]);
    }
}