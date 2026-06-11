<?php

namespace App\Console\Commands;

use App\Models\Route;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Procura, uma única vez, uma foto representativa para cada rota (via Wikipédia
 * pt) e guarda-a em `image_url` na coleção `routes`. Assim o cliente deixa de
 * fazer dezenas de pedidos à Wikipédia a cada carregamento da lista — passa a
 * receber o URL já pronto no payload de `/routes`.
 *
 * Estratégia (igual à que estava no cliente):
 *   1. Geosearch pelas coordenadas do cais de chegada/partida → foto principal
 *      do artigo do local mais próximo.
 *   2. Fallback: pesquisa por texto pelo nome do cais ("<cais>, Aveiro").
 *
 * Uso:
 *   php artisan routes:fetch-images            # só as rotas sem image_url
 *   php artisan routes:fetch-images --force    # reprocessa todas
 */
class FetchRouteImages extends Command
{
    protected $signature = 'routes:fetch-images
                            {--force : Reprocessa também as rotas que já têm image_url}';

    protected $description = 'Procura e guarda na BD uma foto (Wikipédia) para cada rota';

    private const WIKI = 'https://pt.wikipedia.org/w/api.php';

    public function handle(): int
    {
        $query = Route::query();
        if (!$this->option('force')) {
            $query->where(function ($q) {
                $q->whereNull('image_url')->orWhere('image_url', '');
            });
        }

        $routes = $query->get();
        $total = $routes->count();

        if ($total === 0) {
            $this->info('Nada a processar — todas as rotas já têm image_url. Usa --force para reprocessar.');
            return self::SUCCESS;
        }

        $this->info("A processar {$total} rota(s)...");
        $found = 0;

        foreach ($routes as $route) {
            $url = $this->imageForRoute($route);
            // Guarda sempre (mesmo "" quando não encontra) para marcar a rota
            // como já processada e não a repetir em execuções futuras.
            $route->update(['image_url' => $url ?? '']);

            if ($url) {
                $found++;
                $this->line("  ✓ {$route->nome}");
            } else {
                $this->line("  · {$route->nome} (sem foto)");
            }

            usleep(200_000); // 200 ms — simpático para a API da Wikipédia
        }

        $this->info("Concluído: {$found}/{$total} rota(s) com foto.");
        return self::SUCCESS;
    }

    private function imageForRoute(Route $route): ?string
    {
        $coord = $this->coordOf($route);

        $url = null;
        if ($coord) {
            $url = $this->wikiThumb([
                'generator' => 'geosearch',
                'ggsradius' => 10000,
                'ggslimit'  => 6,
                'ggscoord'  => "{$coord['lat']}|{$coord['lon']}",
            ]);
        }

        if (!$url) {
            $place = $route->cais_chegada['nome'] ?? $route->nome ?? null;
            if ($place) {
                $url = $this->wikiThumb([
                    'generator' => 'search',
                    'gsrlimit'  => 1,
                    'gsrsearch' => "{$place}, Aveiro",
                ]);
            }
        }

        return $url;
    }

    private function coordOf(Route $route): ?array
    {
        foreach ([$route->cais_chegada, $route->cais_partida] as $cais) {
            $lat = isset($cais['latitude']) ? (float) $cais['latitude'] : NAN;
            $lon = isset($cais['longitude']) ? (float) $cais['longitude'] : NAN;
            if (is_finite($lat) && is_finite($lon)) {
                return ['lat' => $lat, 'lon' => $lon];
            }
        }
        return null;
    }

    private function wikiThumb(array $params): ?string
    {
        $base = [
            'action'      => 'query',
            'format'      => 'json',
            'prop'        => 'pageimages',
            'piprop'      => 'thumbnail',
            'pithumbsize' => 800,
        ];

        try {
            $res = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'RiaPlot/1.0 (route image backfill)'])
                ->get(self::WIKI, array_merge($base, $params));

            if (!$res->ok()) return null;

            $pages = $res->json('query.pages');
            if (!is_array($pages)) return null;

            // Ordena pela ordem do gerador (geosearch = mais próximo primeiro).
            $best = collect($pages)
                ->filter(fn ($p) => !empty($p['thumbnail']['source']))
                ->sortBy('index')
                ->first();

            return $best['thumbnail']['source'] ?? null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
