<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Report extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'reports';

    // `target_type` = 'post' | 'user'
    // `status`      = 'pending' | 'reviewed' | 'dismissed'
    protected $fillable = [
        'reporter_id', 'target_type', 'target_id', 'reason', 'details', 'status',
    ];
}
