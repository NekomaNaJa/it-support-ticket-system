<?php

namespace App\Providers;

// --- (1. Import Events ของ Laravel) ---
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification; // (อันนี้ Laravel มีให้)

// --- (2. Import Listeners การยืนยันตัวตน ของเรา) ---
use App\Listeners\LogUserRegistration;
use App\Listeners\LogUserLogin;

// --- (3. Import Events ของ Ticket ที่เราสร้าง) ---
use App\Events\TicketCreated;
use App\Events\TicketAssigned;
use App\Events\TicketUnassigned;
use App\Events\TicketStatusUpdated;
use App\Events\TicketDeleted;

// --- (4. Import Listeners ของ Ticket ที่เราสร้าง) ---
use App\Listeners\LogTicketCreation;
use App\Listeners\LogTicketAssignment;
use App\Listeners\LogTicketUnassignment;
use App\Listeners\LogTicketStatusUpdate;
use App\Listeners\LogTicketDeletion;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * (นี่คือ "แผนผัง" ที่บอกว่า Event ไหน -> ให้ Listener ตัวไหนทำงาน)
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        
        // --- (คู่ที่ 1: การลงทะเบียน) ---
        Registered::class => [
            // (อันนี้ของ Laravel)
            SendEmailVerificationNotification::class, 
            
            // (อันนี้ของเรา)
            LogUserRegistration::class,
        ],

        // --- (คู่ที่ 2: การล็อกอิน) ---
        Login::class => [
            LogUserLogin::class,
        ],

        // --- (คู่ที่ 3: การสร้าง Ticket) ---
        TicketCreated::class => [
            LogTicketCreation::class,
        ],

        // --- (คู่ที่ 4: การรับงาน Ticket) ---
        TicketAssigned::class => [
            LogTicketAssignment::class,
        ],

        // --- (คู่ที่ 5: การปล่อยงาน Ticket) ---
        TicketUnassigned::class => [
            LogTicketUnassignment::class,
        ],

        // --- (คู่ที่ 6: การอัปเดตสถานะ Ticket) ---
        TicketStatusUpdated::class => [
            LogTicketStatusUpdate::class,
        ],

        // --- (คู่ที่ 7: การลบ Ticket) ---
        TicketDeleted::class => [
            LogTicketDeletion::class,
        ],

    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}