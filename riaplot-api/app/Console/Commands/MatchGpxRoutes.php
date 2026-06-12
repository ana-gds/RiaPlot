<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Route;

/**
 * gpx:match — cruza ficheiros GPX com rotas da DB por proximidade de coordenadas.
 *
 * Para cada GPX extrai o primeiro e último trackpoint e compara com
 * cais_partida/cais_chegada de cada rota (raio configurável, default 1 km).
 * Quando há múltiplos candidatos geográficos, tenta desambiguar pelo nome
 * do ficheiro (extrai termos e conta quantos coincidem com nome+via+cais).
 *
 * Modos:
 *   php artisan gpx:match              → relatório (só leitura)
 *   php artisan gpx:match --apply      → actualiza gpx_file nas rotas com correspondência
 *   php artisan gpx:match --radius=500 → raio de proximidade em metros (default 1000)
 */
class MatchGpxRoutes extends Command
{
    protected $signature = 'gpx:match
        {--apply        : Actualiza gpx_file nas rotas com correspondência}
        {--overwrite    : Com --apply, sobrescreve rotas que já têm gpx_file diferente}
        {--radius=1000  : Raio de proximidade em metros (default 1000)}';

    protected $description = 'Cruza ficheiros GPX com rotas da DB por proximidade e nome';

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

        $routes = Route::whereNotNull('cais_partida')
            ->whereNotNull('cais_chegada')
            ->get(['_id', 'routinav_id', 'nome', 'via', 'gpx_file', 'cais_partida', 'cais_chegada']);

        if ($routes->isEmpty()) {
            $this->error('Nenhuma rota com cais_partida/cais_chegada encontrada na DB.');
            return self::FAILURE;
        }

        $this->info("Rotas na DB: {$routes->count()}\n");

        $alreadySet = $routes->filter(fn ($r) => !empty($r->gpx_file))->count();

        $overwrite = $this->option('overwrite');

        $rows        = [];
        $updated     = 0;
        $matchedGeo  = 0;
        $matchedName = 0;
        $matchedN    = 0;
        $noMatch     = 0;
        $skipped     = 0;
        $hasOther    = 0; // já tem gpx_file diferente, não sobrescreve sem --overwrite

        foreach ($files as $path) {
            $base = basename($path);

            [$startPt, $endPt] = $this->extractEndpoints($path);

            if (!$startPt || !$endPt) {
                $rows[] = [$base, '—', '—', '✗ GPX inválido ou vazio'];
                $noMatch++;
                continue;
            }

            $candidates = $routes->filter(function ($route) use ($startPt, $endPt, $radius) {
                $partida = $route->cais_partida;
                $chegada = $route->cais_chegada;

                if (empty($partida['latitude']) || empty($chegada['latitude'])) return false;

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
                $route   = $candidates->first();
                $label   = $route->nome . ($route->via ? " ({$route->via})" : '');
                $current = $route->gpx_file ?? '';
                $matchedGeo++;

                [$status, $updated, $skipped, $hasOther] = $this->applyMatch(
                    $route, $base, $current, $apply, $overwrite, $updated, $skipped, $hasOther, ''
                );
                $rows[] = [$base, $label, $current ?: '—', $status];

            } else {
                $resolved = $this->disambiguateByName($base, $candidates);

                if ($resolved) {
                    $label   = $resolved->nome . ($resolved->via ? " ({$resolved->via})" : '');
                    $current = $resolved->gpx_file ?? '';
                    $matchedName++;

                    [$status, $updated, $skipped, $hasOther] = $this->applyMatch(
                        $resolved, $base, $current, $apply, $overwrite, $updated, $skipped, $hasOther, ' (por nome)'
                    );
                    $rows[] = [$base, $label, $current ?: '—', $status];

                } else {
                    $labels = $candidates->map(fn ($r) => $r->nome . ($r->via ? " ({$r->via})" : ''))->implode(' | ');
                    $rows[] = [$base, $labels, '—', '⚠ AMBÍGUO (' . $candidates->count() . ' rotas)'];
                    $matchedN++;
                }
            }
        }

        $this->table(
            ['Ficheiro GPX', 'Rota(s) candidata(s)', 'gpx_file actual', 'Estado'],
            $rows
        );

        $this->newLine();
        $this->info('Total ficheiros             : ' . count($files));
        $this->info("Correspondência por coord.  : {$matchedGeo}");
        $this->info("Resolvido por nome          : {$matchedName}");
        $this->info("Ainda ambíguo               : {$matchedN}");
        $this->info("Sem correspondência         : {$noMatch}");
        $this->info("Rotas já com gpx_file       : {$alreadySet}");

        if ($apply) {
            $this->info("Actualizados agora          : {$updated}");
            if ($hasOther) {
                $this->line("Ignorados (já têm outro)    : {$hasOther}  (usa --overwrite para forçar)");
            }
        } else {
            $pending = ($matchedGeo + $matchedName) - $skipped - $hasOther;
            $this->line("\nCorrespondências por aplicar: {$pending}  (usa --apply para actualizar)");
            if ($hasOther) {
                $this->line("Já têm gpx_file diferente   : {$hasOther}  (usa --apply --overwrite para substituir)");
            }
        }

        return self::SUCCESS;
    }

    // -----------------------------------------------------------------------

    /**
     * Quando há múltiplos candidatos geográficos, tenta desambiguar pelo nome
     * do ficheiro. Pontuação combinada de dois sinais independentes:
     *
     *  1. Tokens de nome: conta termos do ficheiro que aparecem em nome+via+cais.
     *  2. rota_direta: ficheiros com 2 segmentos (A__B) preferem rotas directas;
     *     com 3+ segmentos (A__waypoint__B) preferem rotas não-directas.
     *
     * Escolhe apenas se um candidato pontuar estritamente mais que todos os outros.
     */
    private function disambiguateByName(string $basename, $candidates): ?Route
    {
        $terms    = $this->fileTerms($basename);
        $isDirect = $this->looksLikeDirect($basename);

        $best      = null;
        $bestScore = -1;
        $tie       = false;

        foreach ($candidates as $route) {
            $score = $this->nameScore($route, $terms);

            // Bónus de 1 ponto quando a directividade do ficheiro coincide com a rota
            if ($isDirect !== null && $route->rota_direta !== null) {
                if ((bool) $route->rota_direta === $isDirect) {
                    $score++;
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $best      = $route;
                $tie       = false;
            } elseif ($score === $bestScore) {
                $tie = true;
            }
        }

        return ($bestScore > 0 && !$tie) ? $best : null;
    }

    /**
     * Determina se um ficheiro GPX parece ser rota directa (2 segmentos) ou
     * com waypoint (3+ segmentos). Devolve null se não for possível determinar.
     * Ignora prefixos numéricos e segmentos "invert"/"idavolta".
     */
    private function looksLikeDirect(string $basename): ?bool
    {
        $name = preg_replace('/\.gpx$/i', '', $basename);
        $name = preg_replace('/\s*\(\d+\)/', '', $name);
        $name = preg_replace('/^\d+(_\d+)*_/', '', $name); // remove prefixo numérico

        $segments = array_filter(
            explode('__', $name),
            fn ($s) => $s !== '' && !preg_match('/^(invert|idavolta)/i', $s)
        );

        $count = count($segments);
        if ($count === 0) return null;
        if ($count === 2) return true;   // A__B → directa
        if ($count >= 3) return false;   // A__B__C → com waypoint

        return null; // 1 segmento: inclassificável
    }

    /**
     * Extrai tokens significativos do nome do ficheiro GPX.
     *
     * Divide por _ primeiro (antes de normalizar, para não perder separadores),
     * depois filtra números puros, abreviaturas de cais e sufixos conhecidos.
     */
    private function fileTerms(string $basename): array
    {
        // Remove extensão e sufixos entre parênteses como " (1)"
        $name = preg_replace('/\.gpx$/i', '', $basename);
        $name = preg_replace('/\s*\(\d+\)/', '', $name);

        // Divide por underscore(s) — ANTES de normalizar para preservar separadores
        $parts = preg_split('/_+/', $name);

        $skipWords = ['editada', 'cais', 'idavolta', 'edi', 'invert'];

        $tokens = [];
        foreach ($parts as $part) {
            if ($part === '') continue;
            if (preg_match('/^\d+$/', $part)) continue;              // número puro: "15", "7", "108"
            if (preg_match('/^[A-Z]{2,3}$/', $part)) continue;       // abreviatura sem dígito: "ET", "CO", "PDJ"
            if (preg_match('/^[A-Z]{1,5}#?\d+$/', $part)) continue;  // código com dígito: "CO1", "CSJ#1", "BL3"
            if (in_array(strtolower($part), $skipWords)) continue;

            $norm = $this->normalise($part);
            if (strlen($norm) >= 3) {
                $tokens[] = $norm;
            }
        }

        return array_values(array_unique($tokens));
    }

    /**
     * Pontuação de correspondência entre os termos do ficheiro e os campos da rota.
     *
     * Estratégia dupla:
     *  1. Directo: o termo aparece no texto normalizado da rota (haystack).
     *  2. Composto: o termo do ficheiro contém uma palavra da rota — trata nomes
     *     compostos do tipo "CaisBico" que correspondem ao cais "Bico".
     */
    private function nameScore(Route $route, array $terms): int
    {
        $fields = array_filter([
            $route->nome,
            $route->via,
            $route->cais_partida['nome'] ?? null,
            $route->cais_chegada['nome'] ?? null,
        ]);

        $haystack = $this->normalise(implode(' ', $fields));

        // Palavras individuais da rota (para o fallback de nomes compostos)
        $routeWords = array_unique(array_filter(
            array_map([$this, 'normalise'], preg_split('/[^a-zA-ZÀ-ú]+/', implode(' ', $fields))),
            fn ($w) => strlen($w) >= 3
        ));

        $score = 0;
        foreach ($terms as $term) {
            if (str_contains($haystack, $term)) {
                $score++;
                continue;
            }
            // Fallback: "caisbico" contém a palavra de rota "bico"
            foreach ($routeWords as $word) {
                if (str_contains($term, $word)) {
                    $score++;
                    break;
                }
            }
        }

        return $score;
    }

    /** Aplica ou reporta um match; devolve [$status, $updated, $skipped, $hasOther] actualizados. */
    private function applyMatch(
        Route $route, string $base, string $current,
        bool $apply, bool $overwrite,
        int $updated, int $skipped, int $hasOther, string $tag
    ): array {
        if ($current === $base) {
            return ['✓ já definido', $updated, $skipped + 1, $hasOther];
        }

        // Rota já tem outro gpx_file — só sobrescreve com --overwrite
        if (!empty($current) && !$overwrite) {
            $hasOther++;
            $status = "→ já tem: {$current}";
            return [$status, $updated, $skipped, $hasOther];
        }

        if ($apply) {
            $route->update(['gpx_file' => $base]);
            $status = "✓ ACTUALIZADO{$tag}";
            $updated++;
        } else {
            $status = "→ correspondência{$tag}";
        }

        return [$status, $updated, $skipped, $hasOther];
    }

    /**
     * Extrai o primeiro e o último trackpoint de um GPX.
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

    private function dist(array $a, array $b): float
    {
        $latA = deg2rad((float) ($a['lat'] ?? $a['latitude']));
        $latB = deg2rad((float) ($b['lat'] ?? $b['latitude']));
        $dLat = $latB - $latA;
        $dLng = deg2rad((float) ($b['lng'] ?? $b['longitude']) - (float) ($a['lng'] ?? $a['longitude']));

        $h = sin($dLat / 2) ** 2 + cos($latA) * cos($latB) * sin($dLng / 2) ** 2;

        return 2 * 6_371_000 * asin(sqrt($h));
    }

    /** Normaliza: minúsculas, sem acentos, só alfanuméricos. */
    private function normalise(string $s): string
    {
        $s = mb_strtolower($s, 'UTF-8');
        $s = strtr($s, [
            'á'=>'a','à'=>'a','â'=>'a','ã'=>'a','ä'=>'a',
            'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
            'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i',
            'ó'=>'o','ò'=>'o','ô'=>'o','õ'=>'o','ö'=>'o',
            'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u',
            'ç'=>'c','ñ'=>'n',
        ]);
        return preg_replace('/[^a-z0-9]/', '', $s);
    }
}
