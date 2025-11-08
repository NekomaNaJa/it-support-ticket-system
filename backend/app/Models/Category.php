<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $primaryKey = 'category_id';
    public $timestamps = false;
    protected $fillable = ['name', 'description'];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'category_id');
    }

    public function knowledgeBaseArticles()
    {
        return $this->hasMany(KnowledgeBase::class, 'category_id');
    }
}