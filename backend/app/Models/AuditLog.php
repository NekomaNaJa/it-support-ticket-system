<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $primaryKey = 'log_id'; //
    public $timestamps = false; //

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'entity_type',
        'entity_id',
    ];

    /**
     * Log นี้ "เป็นของ" User คนไหน (ผู้กระทำ)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id'); //
    }

    public function entity()
    {
        return $this->morphTo();
    }
}