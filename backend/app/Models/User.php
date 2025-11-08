<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <-- (ตรวจสอบว่ามีบรรทัดนี้)

class User extends Authenticatable
{
    // เพิ่ม HasApiTokens สำหรับ Sanctum
    use HasFactory, Notifiable, HasApiTokens; 

    /**
     * ระบุ Primary Key ที่เรากำหนดเอง
     */
    protected $primaryKey = 'user_id';

    /**
     * การแก้ไขที่สำคัญ:
     * เปลี่ยนจาก $fillable เป็น $guarded = []
     * เพื่ออนุญาตให้ Mass Assign (สร้าง) ทุกฟิลด์ที่เราส่งไป
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * ความสัมพันธ์: User หนึ่งคนมีได้หลาย Ticket
     * (จำเป็นสำหรับหน้า TicketFlowPage)
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id', 'user_id');
    }

    /**
     * ความสัมพันธ์: User หนึ่งคนมีได้หลาย Comment
     */
    public function comments()
    {
        return $this->hasMany(Comment::class, 'user_id', 'user_id');
    }

    /**
    * ความสัมพันธ์: User หนึ่งคนมีได้หลาย KnowledgeBase Article
    */
    public function knowledgeBaseArticles()
    {
        return $this->hasMany(KnowledgeBase::class, 'user_id', 'user_id');
    }
}