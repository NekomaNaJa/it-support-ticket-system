<?php
namespace App\Events;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;
    public $user; // (นี่คือ Staff/User ที่กดลบ)

    /**
     * Create a new event instance.
     */
    public function __construct(Ticket $ticket, User $user)
    {
        $this->ticket = $ticket;
        $this->user = $user;
    }
}