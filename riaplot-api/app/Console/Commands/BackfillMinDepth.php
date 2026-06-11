<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Route;

/**
 * sim:backfill-depth
 *
 * Para as rotas que já têm sim_file mas ainda não têm min_depth (importadas
 * antes desta funcionalidade), lê o JSON e preenche o campo.
 *
 * Uso:
 *   php artisan sim:backfill-depth
 *   php artisan sim:backfill-depth --dry-run
 */
class BackfillMinDepth extends Command
{
    protected $signature = 'sim:backfill-depth
        {--dry-run : Mostra acções sem alterar a DB}';

    protected $description = 'Preenche min_depth nas rotas que têm sim_file mas não têm min_depth';

    public function handle(): int
    {
        $simDir = storage_path('app/sim');
        $isDry  = (bool) $this->option('dry-run');

        $routes = Route::whereNotNull('sim_file')
            ->whereNull('min_depth')
            ->get(['_id', 'nome', 'sim_file']);

        if ($routes->isEmpty()) {
            $this->info('Todas as rotas com sim_file já têm min_depth.');
            return self::SUCCESS;
        }

        $this->info(($isDry ? '[DRY-RUN] ' : '') . "{$routes->count()} rotas a preencher...\n");

        $ok = $missing = $badJson = 0;

        foreach ($routes as $route) {
            $path = "{$simDir}/{$route->sim_file}";

            if (!file_exists($path)) {
                $this->line("  ✗ Ficheiro não encontrado: {$route->sim_file}");
                $missing++;
                continue;
            }

            $data = json_decode(file_get_contents($path), true);
            if (empty($data['positions'])) {
                $this->line("  ✗ JSON inválido: {$route->sim_file}");
                $badJson++;
                continue;
            }

            $depths   = array_filter(array_column($data['positions'], 'z'), 'is_numeric');
            $minDepth = $depths ? round((float) min($depths), 2) : null;

            if ($minDepth === null) {
                $this->line("  ✗ Sem valores z: {$route->nome}");
                $badJson++;
                continue;
            }

            if ($isDry) {
                $this->line("  ✓ [{$route->nome}]  min_depth = {$minDepth} m");
            } else {
                $route->update(['min_depth' => $minDepth]);
                $this->line("  ✓ {$route->nome}  →  {$minDepth} m");
            }

            $ok++;
        }

        $this->newLine();
        $this->table(['Resultado', 'Contagem'], [
            ['Preenchidas',          $ok],
            ['Ficheiro não encontrado', $missing],
            ['JSON inválido / sem z',   $badJson],
        ]);

        return self::SUCCESS;
    }
}
