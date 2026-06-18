<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Maré pré-calculada (modelo Valida4D) para um ponto de referência da Ria.
 *
 * Preenchido por `tides:refresh-points` a partir de config('tides.reference_points').
 * O endpoint /api/tides/local devolve o ponto mais próximo do centro do mapa.
 *
 *   - key        : identificador do ponto (ex: "barra")
 *   - name       : nome legível (ex: "Barra")
 *   - lat, lng   : coordenadas do ponto
 *   - extremes   : [{ datetime (ISO-8601 UTC), height (m, ZH), type: "PM"|"BM" }, …]
 *   - computed_at: instante do último pré-cálculo
 */
class TidePoint extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'tide_points';

    protected $fillable = [
        'key',
        'name',
        'lat',
        'lng',
        'extremes',
        'computed_at',
    ];

    protected $casts = [
        'lat'         => 'float',
        'lng'         => 'float',
        'extremes'    => 'array',
        'computed_at' => 'datetime',
    ];
}
