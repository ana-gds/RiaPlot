<?php

namespace App\Console\Commands;

use App\Models\TidePoint;
use App\Services\Valida4DService;
use Illuminate\Console\Command;
use Throwable;

/**
 * Pré-calcula a maré (Valida4D) para cada ponto de referência da Ria e guarda
 * em `tide_points`. Assim o painel responde de forma instantânea, em vez de
 * chamar o modelo ao vivo (latência ~15s). Agendado diariamente.
 *
 * Uso:
 *   php artisan tides:refresh-points
 */
class RefreshTidePoints extends Command
{
    protected $signature = 'tides:refresh-points';

    protected $description = 'Pré-calcula a maré (Valida4D) dos pontos de referência da Ria';

    public function handle(Valida4DService $valida4d): int
    {
        $points = config('tides.reference_points', []);

        if (empty($points)) {
            $this->error('Sem pontos de referência em config/tides.php.');
            return self::FAILURE;
        }

        $ok = 0;
        $fail = 0;

        foreach ($points as $p) {
            try {
                $extremes = $valida4d->extremes((float) $p['lat'], (float) $p['lng']);

                if (empty($extremes)) {
                    throw new \RuntimeException('o modelo não devolveu extremos');
                }

                TidePoint::updateOrCreate(
                    ['key' => $p['key']],
                    [
                        'name'        => $p['name'],
                        'lat'         => (float) $p['lat'],
                        'lng'         => (float) $p['lng'],
                        'extremes'    => $extremes,
                        'computed_at' => now(),
                    ]
                );

                $ok++;
                $this->info(sprintf('  ✓ %-14s %d extremos', $p['key'], count($extremes)));
            } catch (Throwable $e) {
                $fail++;
                $this->warn(sprintf('  ✗ %-14s %s', $p['key'], $e->getMessage()));
            }
        }

        $this->info("Concluído: {$ok} ok, {$fail} falhados.");

        return self::SUCCESS;
    }
}
