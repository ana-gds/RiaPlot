<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Route extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'routes';

    protected $fillable = [
        'name', 'start_point', 'end_point', 'description',
        'warnings', 'distance', 'gpx_file', 'difficulty',
    ];

    protected $casts = [
        'warnings' => 'array',
    ];
}
