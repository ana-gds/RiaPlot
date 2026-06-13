<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Poi extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'pois';

    public $timestamps = false; // gerimos manualmente como strings ISO

    protected $fillable = [
        '_id',
        'name',
        'coordinates',
        'type',
        'rota',
        'descricao',
        'created_at',
        'updated_at',
    ];
}
