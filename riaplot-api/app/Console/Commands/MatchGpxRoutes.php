<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Route;

/**
 * gpx:match — cruza ficheiros GPX com rotas da DB por proximidade de coordenadas.
 *
 * Para cada GPX extrai o primeiro e último trackpoint e compara com
 * cais_partida/cais_chegada de cada rota (raio configurável, default 1 km).
 *
 * Modos:
 *   php artisan gpx:match              → relatório (só leitura)
 *   php artisan gpx:match --apply      → actualiza gpx_file nas rotas sem ambiguidade
 *   php artisan gpx:match --radius=500 → raio de proximidade em metros (default 1000)
 */
class MatchGpxRoutes extends Command
{
    protected $signature = 'gpx:match
        {--apply        : Actualiza gpx_file nas rotas com correspondência única}
        {--radius=1000  : Raio de proximidade em metros (default 1000)}';

    protected $description = 'Cruza ficheiros GPX com rotas da DB por proximidade das coordenadas de início/fim';

    public function handle(): int
    {
        $dir    = storage_path('app/public/gpx');
        $files  = glob("{$dir}/*.gpx");
        $radius = (int) $this->option('radius');
        $apply  = $this->option('apply');

        if (empty($files)) {
            $this->error("Pasta vazia ou não encontrada: {$dir}");
            return self::FAILURE;
        }

        $this->info('A ler ' . count($files) . " ficheiros GPX (raio {$radius} m)...");

        // Carrega todas as rotas com coordenadas de partida e chegada
        $routes = Route::whereNotNull('cais_partida')
            ->whereNotNull('cais_chegada')
            ->get(['_id', 'routinav_id', 'nome', 'via', 'gpx_file', 'cais_partida', 'cais_chegada']);

        if ($routes->isEmpty()) {
            $this->error('Nenhuma rota com cais_partida/cais_chegada encontrada na DB.');
            return self::FAILURE;
        }

        $this->info("Rotas na DB: {$routes->count()}\n");

        // Indexa as rotas que já têm gpx_file para o relatório final
        $alreadySet = $routes->filter(fn ($r) => !empty($r->gpx_file))->count();

        $rows      = [];
        $updated   = 0;
        $matched1  = 0;
        $matchedN  = 0;
        $noMatch   = 0;
        $skipped   = 0;

        // Para cada ficheiro GPX, extrai início/fim e tenta casar com rotas
        foreach ($files as $path) {
            $base = basename($path);

            [$startPt, $endPt] = $this->extractEndpoints($path);

            if (!$startPt || !$endPt) {
                $rows[] = [$base, '—', '—', '✗ GPX inválido ou vazio'];
                $noMatch++;
                continue;
            }

            // Encontra rotas onde start≈partida E end≈chegada (ou sentido inverso)
            $candidates = $routes->filter(function ($route) use ($startPt, $endPt, $radius) {
                $partida  = $route->cais_partida;
                $chegada  = $route->cais_chegada;

                if (empty($partida['latitude']) || empty($chegada['latitude'])) {
                    return false;
                }

                $fwd = $this->dist($startPt, $partida) <= $radius
                    && $this->dist($endPt,   $chegada) <= $radius;

                $rev = $this->dist($startPt, $chegada) <= $radius
                    && $this->dist($endPt,   $partida) <= $radius;

                return $fwd || $rev;
            });

            if ($candidates->isEmpty()) {
                $rows[] = [
                    $base,
                    sprintf('%.4f,%.4f', $startPt['lat'], $startPt['lng']),
                    sprintf('%.4f,%.4f', $endPt['lat'],   $endPt['lng']),
                    '✗ sem rota correspondente',
                ];
                $noMatch++;
                continue;
            }

            if ($candidates->count() === 1) {
                $route    = $candidates->first();
                $label    = $route->nome . ($route->via ? " ({$route->via})" : '');
                $current  = $route->gpx_file ?? '';
                $matched1++;

                if ($apply && $current !== $base) {
                    $route->update(['gpx_file' => $base]);
                    $status = '✓ ACTUALIZADO';
                    $updated++;
                } elseif ($current === $base) {
                    $status = '✓ já definido';
                    $skipped++;
                } else {
                    $status = '→ correspondência única';
                }

                $rows[] = [$base, $label, $current ?: '—', $status];
            } else {
                // Múltiplas rotas candidatas
                $labels = $candidates->map(fn ($r) => $r->nome . ($r->via ? " ({$r->via})" : ''))->implode(' | ');
                $rows[] = [
                    $base,
                    $labels,
                    '—',
                    '⚠ AMBÍGUO (' . $candidates->count() . ' rotas)',
                ];
                $matchedN++;
            }
        }

        $this->table(
            ['Ficheiro GPX', 'Rota(s) candidata(s)', 'gpx_file actual', 'Estado'],
            $rows
        );

        $this->newLine();
        $this->info('Total ficheiros : ' . count($files));
        $this->info("Correspondência única : {$matched1}");
        $this->info("Ambíguos (várias rotas) : {$matchedN}");
        $this->info("Sem correspondência : {$noMatch}");
        $this->info("Rotas já com gpx_file : {$alreadySet}");

        if ($apply) {
            $this->info("Actualizados agora : {$updated}");
        } else {
            $pending = $matched1 - $skipped;
            $this->line("\nCorrespondências únicas por aplicar: {$pending}  (usa --apply para actualizar)");
        }

        return self::SUCCESS;
    }

    // -----------------------------------------------------------------------

    /**
     * Extrai o primeiro e o último trackpoint de um GPX.
     * Devolve [start, end] onde cada um é ['lat' => float, 'lng' => float].
     */
    private function extractEndpoints(string $path): array
    {
        $content = @file_get_contents($path);
        if (!$content) return [null, null];

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($content);
        libxml_clear_errors();
        if (!$xml) return [null, null];

        $xml->registerXPathNamespace('gpx', 'http://www.topografix.com/GPX/1/1');
        $pts = $xml->xpath('//gpx:trkpt') ?: $xml->xpath('//trkpt');

        if (empty($pts)) return [null, null];

        $first = $pts[0];
        $last  = $pts[count($pts) - 1];

        return [
            ['lat' => (float) $first['lat'], 'lng' => (float) $first['lon']],
            ['lat' => (float) $last['lat'],  'lng' => (float) $last['lon']],
        ];
    }

    /**
     * Distância aproximada em metros entre dois pontos usando a fórmula de Haversine.
     */
    private function dist(array $a, array $b): float
    {
        $latA = deg2rad((float) ($a['lat'] ?? $a['latitude']));
        $latB = deg2rad((float) ($b['lat'] ?? $b['latitude']));
        $dLat = $latB - $latA;
        $dLng = deg2rad((float) ($b['lng'] ?? $b['longitude']) - (float) ($a['lng'] ?? $a['longitude']));

        $h = sin($dLat / 2) ** 2 + cos($latA) * cos($latB) * sin($dLng / 2) ** 2;

        return 2 * 6_371_000 * asin(sqrt($h));
    }
}
