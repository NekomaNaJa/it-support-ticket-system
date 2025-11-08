<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login; // <-- (1. Import Event 'Login' ของ Laravel)
use App\Models\AuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogUserLogin
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        // (2. "แกะ" user ที่เพิ่งล็อกอิน ออกมาจาก Event)
        $user = $event->user;

        // (3. สร้าง AuditLog)
        AuditLog::create([
            'user_id' => $user->user_id, 
            'action' => 'user_logged_in', // (Action ใหม่)
            'description' => "User '{$user->name}' logged in.",
            'entity_type' => get_class($user),
            'entity_id' => $user->user_id
        ]);
    }
}