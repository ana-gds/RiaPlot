<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Boat extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'boats';

    protected $fillable = [
        'user_id', 'name', 'type', 'length', 'height',
        'beam', 'speed', 'upper_clearance', 'lower_clearance', 'photo_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
