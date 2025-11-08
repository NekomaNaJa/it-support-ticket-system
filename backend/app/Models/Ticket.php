<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $primaryKey = 'ticket_id'; //

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'sla_hours',
        'user_id',
        'category_id',
    ];

    /**
     * กำหนดให้ Laravel โหลดความสัมพันธ์เหล่านี้มาด้วยเสมอ
     */
    protected $with = ['user', 'category']; //

    // --- Relationships (ความสัมพันธ์ตาม Diagram) ---

    /**
     * Ticket นี้ "เป็นของ" User คนไหน (ผู้สร้าง)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id'); //
    }

    /**
     * Ticket นี้ "อยู่ใน" Category ไหน
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id'); //
    }

    public function agent()
    {   
        // 'agent_id' คือ Foreign Key ในตาราง tickets
        // 'user_id' คือ Primary Key ในตาราง users
        return $this->belongsTo(User::class, 'agent_id', 'user_id');
    }

    /**
     * Ticket นี้ "มี" Comment อะไรบ้าง
     */
    public function comments()
    {
        return $this->hasMany(Comment::class, 'ticket_id', 'ticket_id'); //
    }

    /**
     * Ticket นี้ "มี" ไฟล์แนบอะไรบ้าง
     */
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}