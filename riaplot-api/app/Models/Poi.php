<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Poi extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'pois';

    protected $fillable = ['name', 'coordinates', 'type'];

    protected $casts = [
        'coordinates' => 'array',
    ];
}
