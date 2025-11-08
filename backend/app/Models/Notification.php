<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'notif_id'; //
    public $timestamps = false; //

    protected $fillable = [
        'user_id',
        'message',
        'is_read',
    ];

    /**
     * ระบุว่าฟิลด์นี้ควรเป็น boolean (true/false)
     */
    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Notification นี้ "เป็นของ" User คนไหน
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id'); //
    }
}