<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'posts';

    protected $fillable = [
        'user_id', 'title', 'description',
        'route_doc', 'location', 'post_url', 'likes', 'comments',
    ];

    protected $casts = [
        'post_url' => 'array',
        'likes'    => 'array',
        'comments' => 'array',
    ];
}
