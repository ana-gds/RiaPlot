<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Route extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'routes';

    protected $fillable = [
        // Identificação
        'routinav_id',       // ID numérico original do Routinav (ex: 1047)
        'nome',              // Nome curto (ex: "Carregal → ANGE")
        'descricao',         // Texto de descrição do percurso (narrativo)
        'descricao_turistica', // Descrição turística/comercial (Fase 6)
        'via',               // Complemento ao nome (ex: "pela Testada", "por S. Jacinto")

        // Cais embebidos (denormalizado conforme roadmap)
        'cais_partida',      // { nome, latitude, longitude }
        'cais_chegada',      // { nome, latitude, longitude }

        // Dados da rota
        'distancia_nm',      // Distância em milhas náuticas (float)
        'gpx_file',          // Nome do ficheiro GPX em storage (ex: "100_ET_1_Varela__Testada__CM_4_ANGE.gpx")
        'rota_direta',       // true = sem entroncamento
        'entroncamento',     // { nome, latitude, longitude } | null

        // Restrições de navegação (extraídas do PDF de curadoria)
        'calado_max',        // Calado máximo recomendado em metros (float, ex: 1.0, 0.5, 0.3)
        'condicoes_mare',    // "qualquer" | "favoravel" | "estofo" | "mares_vivas"
        'recomendada',       // true = rota destacada/curada

        // Avisos e alertas
        'warnings',          // array de strings com avisos específicos

        // Metadados
        'video_url',         // URL de vídeo (Fase 6)
        'pontos_interesse',  // array de { poi_id, nome, km_do_inicio }
        'simulation_data',   // { startDate, positions, waterLevels } — preenchido pela API Hidromod
        'trackpoints',
    ];

    protected $casts = [
        'cais_partida'      => 'array',
        'cais_chegada'      => 'array',
        'entroncamento'     => 'array',
        'warnings'          => 'array',
        'pontos_interesse'  => 'array',
        'simulation_data'   => 'array',
        'trackpoints' => 'array',
        'distancia_nm'      => 'float',
        'calado_max'        => 'float',
        'routinav_id'       => 'integer',
        'rota_direta'       => 'boolean',
        'recomendada'       => 'boolean',
    ];
}
