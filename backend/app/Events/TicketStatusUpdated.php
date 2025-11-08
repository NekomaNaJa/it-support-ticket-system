<?php
namespace App\Events;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketStatusUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;
    public $user;
    public $oldStatus; // (สถานะเก่า)
    public $newStatus; // (สถานะใหม่)

    /**
     * Create a new event instance.
     */
    public function __construct(Ticket $ticket, User $user, string $oldStatus, string $newStatus)
    {
        $this->ticket = $ticket;
        $this->user = $user;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}