<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notifications';

    protected $fillable = ['type', 'user', 'post', 'read'];

    protected $casts = [
        'read' => 'boolean',
    ];
}
