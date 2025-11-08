<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered; // <-- (1. Import Event ของ Laravel)
use App\Models\AuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogUserRegistration
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        // (2. "แกะ" user ที่เพิ่งลงทะเบียน ออกมาจาก Event)
        $user = $event->user;

        // (3. สร้าง AuditLog)
        AuditLog::create([
            'user_id' => $user->user_id, 
            'action' => 'user_registered', // (Action ใหม่)
            'description' => "New user registered: '{$user->name}' ({$user->email})",

            // (สิ่งที่ "ถูกกระทำ" คือ User คนนั้นเอง)
            'entity_type' => get_class($user), // (จะได้ "App\Models\User")
            'entity_id' => $user->user_id
        ]);
    }
}