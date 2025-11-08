<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attachment extends Model
{
    use HasFactory;
    protected $primaryKey = 'attachment_id';
    public $timestamps = false;

    /**
     * (แก้ไข)
     * ระบุ Field ที่อนุญาตให้บันทึกได้
     */
    protected $fillable = [
        'file_name',
        'file_path',
        'size',
        'attachmentcol',
        'attachable_id',
        'attachable_type',
        'uploaded_at'
    ];

    public function attachable()
    {
        return $this->morphTo();
    }
}