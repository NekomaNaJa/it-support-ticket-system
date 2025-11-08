<?php

namespace App\Events;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketAssigned
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;
    public $user;

    /**
     * Create a new event instance.
     */
    // (บังคับว่าต้องส่ง Ticket และ User (Staff) มาด้วย)
    public function __construct(Ticket $ticket, User $user)
    {
        $this->ticket = $ticket;
        $this->user = $user;
    }
}