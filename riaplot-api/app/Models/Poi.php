<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Poi extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'pois';

    public $timestamps = false; // gerimos manualmente como strings ISO

    protected $fillable = [
        '_id',          // UUID string explícito
        'name',         // nome do POI, ex: 'Boia Bombordo 1'
        'coordinates',  // array [lat, lng] — igual ao schema existente
        'type',         // 'boia_bombordo' | 'boia_estibordo'
        'created_at',   // string ISO 8601
        'updated_at',   // string ISO 8601
    ];
}
