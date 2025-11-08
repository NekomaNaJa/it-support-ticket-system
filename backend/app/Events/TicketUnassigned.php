<?php
namespace App\Events;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketUnassigned
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;
    public $user; // (นี่คือ Staff ที่กดปล่อยงาน)

    /**
     * Create a new event instance.
     */
    public function __construct(Ticket $ticket, User $user)
    {
        $this->ticket = $ticket;
        $this->user = $user;
    }
}