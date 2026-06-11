<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Extremo de maré (preia-mar ou baixa-mar) para um porto.
 *
 * Fonte: previsão da FCUL (Prof. Carlos Antunes) ajustada ao marégrafo de
 * Aveiro com dados do Instituto Hidrográfico. Importado por `tides:import`.
 *
 *   - port    : identificador do porto (ex: "aveiro")
 *   - datetime: instante do extremo, em UTC (os ficheiros FCUL estão em TU)
 *   - height  : altura da água em metros, referida ao Zero Hidrográfico (ZH)
 *   - type    : "PM" (preia-mar) | "BM" (baixa-mar)
 */
class Tide extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'tides';

    protected $fillable = [
        'port',
        'datetime',
        'height',
        'type',
    ];

    protected $casts = [
        'datetime' => 'datetime',
        'height'   => 'float',
    ];
}
