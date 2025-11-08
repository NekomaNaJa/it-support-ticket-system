<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Attachment;
use App\Models\Category;
use App\Models\User;

class KnowledgeBase extends Model
{
    use HasFactory;

    protected $table = 'knowledge_base';
    protected $primaryKey = 'article_id';
    
    public $timestamps = false;

    protected $fillable = [
        'title',
        'content',
        'category_id',
        'user_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}