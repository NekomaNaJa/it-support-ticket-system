<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $primaryKey = 'comment_id'; // ระบุ Primary Key
    public $timestamps = true; // (เราใช้ created_at)
    
    // (สำคัญ) ระบุฟิลด์ที่อนุญาตให้บันทึก
    protected $fillable = [
        'message',
        'ticket_id',
        'user_id'
    ];

    /**
     * Comment นี้เป็นของ Ticket ไหน
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id', 'ticket_id');
    }

    /**
     * Comment นี้เป็นของ User คนไหน
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}