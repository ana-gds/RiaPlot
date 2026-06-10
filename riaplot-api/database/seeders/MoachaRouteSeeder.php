<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;

/**
 * MoachaRouteSeeder — 2 rotas adquiridas em 07/05/2026 pelo Prof. Jorge
 *
 * Percurso: Canal da Moacha, entrando a sul da Cabeça do Cão
 * e saindo pelo Norte da Cabeça do Travessadouro.
 * Inclui visita à Cale do Ouro e Cale do Amoroso (ficheiro B).
 *
 * Ficheiros GPX: storage/app/public/gpx/
 *   - moacha_a_07maio2026.gpx  (percurso principal, 14,11 nm)
 *   - moacha_b_07maio2026.gpx  (Cale do Ouro + Cale do Amoroso, 2,04 nm)
 *
 * Nota: trackpoints são preenchidos pelo comando Artisan gpx:import
 */
class MoachaRouteSeeder extends Seeder
{
    public function run(): void
    {
        // Remove apenas estas rotas se já existirem (pelo nome)
        Route::where('nome', 'like', '%Moacha%')->delete();

        $routes = [
            [
                // Rota A — percurso principal do Canal da Moacha
                'routinav_id'    => null,
                'nome'           => 'Canal da Moacha',
                'via'            => 'pela Cabeça do Cão',
                'descricao'      => 'Percurso pelo Canal da Moacha, entrando a sul da Cabeça do Cão e saindo pelo Norte da Cabeça do Travessadouro. Rota técnica com dois encalhanços registados na aquisição original — navegar com atenção às condições de maré.',
                'distancia_nm'   => 14.11,
                'gpx_file'       => 'moacha_a_07maio2026.gpx',
                'trackpoints'    => [], // preenchido pelo Artisan gpx:import
                'cais_partida'   => [
                    'nome'      => 'ANGE',
                    'latitude'  => 40.613998,
                    'longitude' => -8.739780,
                ],
                'cais_chegada'   => [
                    'nome'      => 'Moacha Norte',
                    'latitude'  => 40.689097,
                    'longitude' => -8.691914,
                ],
                'calado_max'     => 0.5,
                'condicoes_mare' => 'estofo',
                'recomendada'    => true,
                'rota_direta'    => true,
                'warnings'       => [
                    'Dois encalhanços registados na aquisição original — navegar em estofo de maré',
                    'Rota adquirida em 07/05/2026 pelo Prof. Jorge',
                ],
            ],
            [
                // Rota B — Cale do Ouro + Cale do Amoroso
                'routinav_id'    => null,
                'nome'           => 'Cale do Ouro e Cale do Amoroso',
                'via'            => 'a SE da Ilha dos Ovos',
                'descricao'      => 'Pequeno percurso de exploração às Cales do Ouro e do Amoroso, a sudeste da Ilha dos Ovos. Zona de interesse náutico e ambiental.',
                'distancia_nm'   => 2.04,
                'gpx_file'       => 'moacha_b_07maio2026.gpx',
                'trackpoints'    => [], // preenchido pelo Artisan gpx:import
                'cais_partida'   => [
                    'nome'      => 'Ilha dos Ovos (Norte)',
                    'latitude'  => 40.679531,
                    'longitude' => -8.695552,
                ],
                'cais_chegada'   => [
                    'nome'      => 'Cale do Amoroso',
                    'latitude'  => 40.660351,
                    'longitude' => -8.726170,
                ],
                'calado_max'     => 0.5,
                'condicoes_mare' => 'favoravel',
                'recomendada'    => false,
                'rota_direta'    => true,
                'warnings'       => [
                    'Rota adquirida em 07/05/2026 pelo Prof. Jorge',
                ],
            ],
        ];

        foreach ($routes as $route) {
            Route::create($route);
        }

        $this->command->info('✅ 2 rotas do Canal da Moacha inseridas.');
        $this->command->warn('   ⚠  Corre agora: php artisan gpx:import');
    }
}
