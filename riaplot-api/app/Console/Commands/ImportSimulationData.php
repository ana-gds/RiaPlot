<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Route;
use App\Models\Dock;

/**
 * sim:import — lê os JSON em storage/app/sim/, cruza com as rotas da DB
 * por proximidade geográfica (primeiro/último ponto ↔ cais_partida/cais_chegada),
 * popula trackpoints + sim_file. Cria novas rotas para JSONs sem correspondência.
 *
 * Uso:
 *   php artisan sim:import              → importa tudo
 *   php artisan sim:import --dry-run    → mostra o que faria sem alterar nada
 *   php artisan sim:import --skip-existing → salta rotas que já têm sim_file
 *   php artisan sim:import --limit=10   → processa só os primeiros 10 ficheiros
 */
class ImportSimulationData extends Command
{
    protected $signature = 'sim:import
        {--dry-run        : Mostra acções sem alterar a DB}
        {--skip-existing  : Salta ficheiros cujas rotas já têm sim_file definido}
        {--limit=         : Processa só os primeiros N ficheiros}
        {--step=10        : Sub-amostragem de trackpoints para a DB (1=todos, 10=cada 10.º)}';

    protected $description = 'Importa rotas e dados de simulação dos JSON em storage/app/sim/';

    // Raio em metros para considerar que um ponto "pertence" a um cais
    private const DOCK_RADIUS_M   = 800;
    // Raio mais tolerante para criar novas rotas (cais pode estar um pouco afastado)
    private const CREATE_RADIUS_M = 2000;

    public function handle(): int
    {
        $simDir = storage_path('app/sim');

        // Todos os ficheiros v_ (inclui v_invert_ — cada um é uma direcção válida)
        $files = array_values(glob("{$simDir}/v_*.json") ?: []);

        if (!$files) {
            $this->error("Nenhum ficheiro encontrado em {$simDir}");
            return self::FAILURE;
        }

        if ($limit = $this->option('limit')) {
            $files = array_slice($files, 0, (int) $limit);
        }

        $total = count($files);
        $isDry = (bool) $this->option('dry-run');
        $step  = max(1, (int) ($this->option('step') ?? 10));
        $this->info(($isDry ? '[DRY-RUN] ' : '') . "A processar {$total} ficheiros (trackpoints cada {$step}.º ponto)...\n");

        // Carrega docks e rotas existentes uma única vez
        $docks  = Dock::all(['nome', 'latitude', 'longitude'])->toArray();
        $routes = Route::all(['_id', 'nome', 'cais_partida', 'cais_chegada', 'sim_file'])->keyBy('_id');

        $updated = $created = $skipped = $noMatch = $badJson = 0;
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($files as $path) {
            $basename = basename($path);

            // --skip-existing: ignora se alguma rota já aponta para este ficheiro
            if ($this->option('skip-existing') && $routes->contains('sim_file', $basename)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            // Lê o JSON
            $data = json_decode(file_get_contents($path), true);
            if (!$data || empty($data['positions'])) {
                $badJson++;
                $bar->advance();
                continue;
            }

            $positions = $data['positions'];
            $first = $positions[0];
            $last  = $positions[count($positions) - 1];

            // Profundidade mínima (ponto mais raso da rota ao ZH), usada no aviso de navegabilidade
            $depths   = array_filter(array_column($positions, 'z'), 'is_numeric');
            $minDepth = $depths ? round((float) min($depths), 2) : null;

            // Trackpoints sub-amostrados para a DB (mapa); JSON completo fica em disco
            $trackpoints = [];
            for ($i = 0; $i < count($positions); $i += $step) {
                $p = $positions[$i];
                $trackpoints[] = [
                    'lat' => (float) $p['x'],
                    'lng' => (float) $p['y'],
                    'ele' => isset($p['z']) ? (float) $p['z'] : null,
                ];
            }

            // Tenta fazer match com rota existente (dentro de DOCK_RADIUS_M)
            $match = $this->findRoute(
                (float) $first['x'], (float) $first['y'],
                (float) $last['x'],  (float) $last['y'],
                $routes, self::DOCK_RADIUS_M
            );

            if ($match) {
                if ($isDry) {
                    $this->line("\n  [UPDATE] {$basename}  →  '{$match->nome}'");
                } else {
                    $match->update(['trackpoints' => $trackpoints, 'sim_file' => $basename, 'min_depth' => $minDepth]);
                    // Actualiza a cópia em memória para evitar duplicados
                    $routes[$match->_id]->sim_file = $basename;
                }
                $updated++;
            } else {
                // Dock mais próximo para criar nova rota
                $dockStart = $this->nearestDock((float)$first['x'], (float)$first['y'], $docks, self::CREATE_RADIUS_M);
                $dockEnd   = $this->nearestDock((float)$last['x'],  (float)$last['y'],  $docks, self::CREATE_RADIUS_M);

                if (!$dockStart || !$dockEnd) {
                    $noMatch++;
                    $bar->advance();
                    continue;
                }

                $nome = $dockStart['nome'] . ' → ' . $dockEnd['nome'];

                if ($isDry) {
                    $this->line("\n  [CREATE] {$basename}  →  '{$nome}'");
                } else {
                    $newRoute = Route::create([
                        'nome'         => $nome,
                        'cais_partida' => ['nome' => $dockStart['nome'], 'latitude' => $dockStart['latitude'], 'longitude' => $dockStart['longitude']],
                        'cais_chegada' => ['nome' => $dockEnd['nome'],   'latitude' => $dockEnd['latitude'],   'longitude' => $dockEnd['longitude']],
                        'trackpoints'  => $trackpoints,
                        'sim_file'     => $basename,
                        'min_depth'    => $minDepth,
                    ]);
                    // Adiciona à coleção em memória para evitar duplicados no mesmo batch
                    $routes[$newRoute->_id] = $newRoute;
                }
                $created++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(['Resultado', 'Contagem'], [
            ['Actualizadas',            $updated],
            ['Criadas',                 $created],
            ['Saltadas (já existentes)', $skipped],
            ['Sem cais próximo',        $noMatch],
            ['JSON inválido',           $badJson],
        ]);

        return self::SUCCESS;
    }

    // -----------------------------------------------------------------------

    /**
     * Devolve a rota existente cujo cais_partida está a menos de $radiusM metros
     * do ponto de início E cujo cais_chegada está a menos de $radiusM do ponto final.
     * Quando há várias candidatas, escolhe a de menor soma de distâncias.
     */
    private function findRoute(float $sLat, float $sLng, float $eLat, float $eLng, $routes, float $radiusM): ?Route
    {
        $best      = null;
        $bestScore = PHP_FLOAT_MAX;

        foreach ($routes as $route) {
            $cp = $route->cais_partida;
            $cc = $route->cais_chegada;
            if (!$cp || !$cc) continue;
            if (!isset($cp['latitude'], $cp['longitude'], $cc['latitude'], $cc['longitude'])) continue;

            $dStart = $this->haversine($sLat, $sLng, (float)$cp['latitude'], (float)$cp['longitude']);
            $dEnd   = $this->haversine($eLat, $eLng, (float)$cc['latitude'], (float)$cc['longitude']);

            if ($dStart <= $radiusM && $dEnd <= $radiusM && ($dStart + $dEnd) < $bestScore) {
                $bestScore = $dStart + $dEnd;
                $best      = $route;
            }
        }

        return $best;
    }

    /**
     * Devolve o dock mais próximo dentro de $maxM metros, ou null se nenhum estiver
     * dentro do raio.
     */
    private function nearestDock(float $lat, float $lng, array $docks, float $maxM): ?array
    {
        $best     = null;
        $bestDist = PHP_FLOAT_MAX;

        foreach ($docks as $dock) {
            if (!isset($dock['latitude'], $dock['longitude'])) continue;
            $d = $this->haversine($lat, $lng, (float)$dock['latitude'], (float)$dock['longitude']);
            if ($d < $bestDist) {
                $bestDist = $d;
                $best     = $dock;
            }
        }

        return ($bestDist <= $maxM) ? $best : null;
    }

    /** Distância em metros entre dois pontos geográficos (fórmula de Haversine). */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        static $R = 6371000;
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $dPhi = deg2rad($lat2 - $lat1);
        $dLam = deg2rad($lng2 - $lng1);
        $a    = sin($dPhi / 2) ** 2 + cos($phi1) * cos($phi2) * sin($dLam / 2) ** 2;
        return 2 * $R * asin(sqrt($a));
    }
}
