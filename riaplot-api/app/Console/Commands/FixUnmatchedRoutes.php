<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Route;

/**
 * sim:fix-unmatched
 *
 * Para as rotas que ficaram sem trackpoints após sim:import (porque as suas
 * coordenadas de cais divergem das coordenadas GPS dos ficheiros JSON), tenta
 * fazer o match pelo NOME dos cais extraído do nome do ficheiro JSON.
 *
 * Uso:
 *   php artisan sim:fix-unmatched           → aplica
 *   php artisan sim:fix-unmatched --dry-run → mostra sem alterar
 */
class FixUnmatchedRoutes extends Command
{
    protected $signature = 'sim:fix-unmatched
        {--dry-run : Mostra acções sem alterar a DB}';

    protected $description = 'Liga rotas sem trackpoints aos JSON de simulação usando o nome dos cais';

    public function handle(): int
    {
        $simDir = storage_path('app/sim');
        $isDry  = (bool) $this->option('dry-run');

        // Rotas sem trackpoints (os candidatos a corrigir)
        $unmatched = Route::where(function ($q) {
            $q->whereNull('trackpoints')
              ->orWhere('trackpoints', []);
        })->get(['_id', 'nome', 'cais_partida', 'cais_chegada', 'sim_file']);

        if ($unmatched->isEmpty()) {
            $this->info('Todas as rotas já têm trackpoints.');
            return self::SUCCESS;
        }

        $this->info(($isDry ? '[DRY-RUN] ' : '') . "{$unmatched->count()} rotas sem trackpoints. A tentar match por nome...\n");

        // Índice: chave normalizada "partida__chegada" → caminho do ficheiro JSON
        $jsonIndex = $this->buildJsonIndex($simDir);

        $fixed   = 0;
        $notFound = 0;

        foreach ($unmatched as $route) {
            $partida  = $this->normalise($route->cais_partida['nome'] ?? '');
            $chegada  = $this->normalise($route->cais_chegada['nome'] ?? '');

            if (!$partida || !$chegada) {
                $notFound++;
                continue;
            }

            $jsonPath = $this->findJson($partida, $chegada, $jsonIndex);

            if (!$jsonPath) {
                $this->line("  ✗ Sem JSON: {$route->nome}");
                $notFound++;
                continue;
            }

            $data = json_decode(file_get_contents($jsonPath), true);
            if (empty($data['positions'])) {
                $notFound++;
                continue;
            }

            $positions   = $data['positions'];
            $depths      = array_filter(array_column($positions, 'z'), 'is_numeric');
            $minDepth    = $depths ? round((float) min($depths), 2) : null;

            $step        = 10; // sub-amostragem igual ao sim:import
            $trackpoints = [];
            for ($i = 0; $i < count($positions); $i += $step) {
                $p = $positions[$i];
                $trackpoints[] = [
                    'lat' => (float) $p['x'],
                    'lng' => (float) $p['y'],
                    'ele' => isset($p['z']) ? (float) $p['z'] : null,
                ];
            }

            $basename = basename($jsonPath);

            if ($isDry) {
                $this->line("  ✓ [{$route->nome}]  ←  {$basename}");
            } else {
                $route->update(['trackpoints' => $trackpoints, 'sim_file' => $basename, 'min_depth' => $minDepth]);
                $this->line("  ✓ {$route->nome}");
            }

            $fixed++;
        }

        $this->newLine();
        $this->table(['Resultado', 'Contagem'], [
            ['Corrigidas', $fixed],
            ['Sem correspondência', $notFound],
        ]);

        return self::SUCCESS;
    }

    // -----------------------------------------------------------------------

    /**
     * Constrói um índice dos ficheiros JSON presentes em storage/app/sim/.
     * Chave: "partida__chegada" (nomes normalizados extraídos do nome do ficheiro).
     * Valor: caminho completo do ficheiro.
     * Só inclui ficheiros de direcção directa (v_, não v_invert_).
     */
    private function buildJsonIndex(string $dir): array
    {
        $index = [];

        foreach (glob("{$dir}/v_*.json") ?: [] as $path) {
            $base = basename($path);
            if (str_starts_with($base, 'v_invert_')) continue;

            // Remove prefixo "v_", sufixo "_UUID.json" e extensão ".gpx"
            $inner = preg_replace('/^v_/', '', $base);
            $inner = preg_replace('/_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.json$/', '', $inner);
            $inner = preg_replace('/\.gpx$/', '', $inner);

            // Divide em partida / chegada pelo separador "__"
            $parts = explode('__', $inner, 2);
            if (count($parts) !== 2) continue;

            [$rawA, $rawB] = $parts;

            $normA = $this->normaliseFilePart($rawA);
            $normB = $this->normaliseFilePart($rawB);

            if ($normA && $normB) {
                $index["{$normA}__{$normB}"] = $path;
            }
        }

        return $index;
    }

    /**
     * Tenta encontrar o JSON cujos nomes normalizados contêm as strings
     * de $partida e $chegada.
     */
    private function findJson(string $partida, string $chegada, array $index): ?string
    {
        // Tentativa exacta
        $key = "{$partida}__{$chegada}";
        if (isset($index[$key])) return $index[$key];

        // Tentativa por substring: o nome no ficheiro pode ser mais longo ou abreviado
        foreach ($index as $indexKey => $path) {
            [$idxA, $idxB] = explode('__', $indexKey, 2);
            $aMatch = str_contains($idxA, $partida) || str_contains($partida, $idxA);
            $bMatch = str_contains($idxB, $chegada)  || str_contains($chegada,  $idxB);
            if ($aMatch && $bMatch) return $path;
        }

        return null;
    }

    /** Normaliza um nome de cais para comparação: minúsculas, sem acentos, só alfanuméricos. */
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

    /** Normaliza a parte do nome de cais extraída do nome do ficheiro JSON. */
    private function normaliseFilePart(string $part): string
    {
        // Remove o código de cais inicial (ex: "co1", "csj1", "il11", "cm4")
        $part = preg_replace('/^[a-z]+_?\d+_?/', '', $part);
        return $this->normalise($part);
    }
}
