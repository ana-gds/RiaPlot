<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Dock extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'docks';

    protected $fillable = [
        'routinav_id',
        'nome',
        'latitude',
        'longitude',
        'tipo',
        'imagem',
        'descricao',
        'estado'
    ];

    protected $casts = [
        'latitude'    => 'float',
        'longitude'   => 'float',
        'routinav_id' => 'integer',
    ];
}
