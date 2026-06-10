<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Route;

class ImportGpxRoutes extends Command
{
    protected $signature   = 'gpx:import {--route= : ID MongoDB de uma rota específica}';
    protected $description  = 'Parseia os ficheiros GPX em storage/app/public/gpx/ e popula o campo trackpoints nas rotas';

    public function handle(): int
    {
        $query = Route::whereNotNull('gpx_file')
                      ->where('gpx_file', '!=', '');

        // Se passaram --route=<id>, processa só essa
        if ($routeId = $this->option('route')) {
            $query->where('_id', $routeId);
        }

        $routes = $query->get();

        if ($routes->isEmpty()) {
            $this->warn('Nenhuma rota com gpx_file encontrada.');
            return self::SUCCESS;
        }

        $this->info("A processar {$routes->count()} rota(s)...\n");
        $ok = 0;
        $fail = 0;

        foreach ($routes as $route) {
            $filename = $route->gpx_file;
            $path     = storage_path("app/public/gpx/{$filename}");

            if (!file_exists($path)) {
                $this->warn("  ✗ Ficheiro não encontrado: {$filename}");
                $fail++;
                continue;
            }

            $trackpoints = $this->parseGpx($path);

            if (empty($trackpoints)) {
                $this->warn("  ✗ Nenhum trackpoint extraído de: {$filename}");
                $fail++;
                continue;
            }

            // Remove pontos estacionários consecutivos (mesmo lat/lon)
            $trackpoints = $this->removeDuplicates($trackpoints);

            $route->update(['trackpoints' => $trackpoints]);

            $this->info("  ✓ {$route->nome} — {$filename} — " . count($trackpoints) . " pontos");
            $ok++;
        }

        $this->newLine();
        $this->info("Concluído: {$ok} importadas, {$fail} falhadas.");

        return self::SUCCESS;
    }

    private function parseGpx(string $path): array
    {
        $content = file_get_contents($path);

        // Suprime erros de namespace desconhecidos
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($content);
        libxml_clear_errors();

        if (!$xml) {
            return [];
        }

        // Regista namespace GPX 1.1 (o mais comum)
        $xml->registerXPathNamespace('gpx', 'http://www.topografix.com/GPX/1/1');

        // Tenta com namespace primeiro, depois sem (alguns GPX omitem-no)
        $trkpts = $xml->xpath('//gpx:trkpt');

        if (empty($trkpts)) {
            // Fallback sem namespace
            $trkpts = $xml->xpath('//trkpt');
        }

        if (empty($trkpts)) {
            return [];
        }

        $trackpoints = [];

        foreach ($trkpts as $pt) {
            $lat = isset($pt['lat']) ? (float) $pt['lat'] : null;
            $lon = isset($pt['lon']) ? (float) $pt['lon'] : null;

            if ($lat === null || $lon === null) {
                continue;
            }

            // Elevação — pode estar com ou sem namespace
            $ele = null;
            $eleNode = $pt->xpath('gpx:ele');
            if (!empty($eleNode)) {
                $ele = (float) $eleNode[0];
            } elseif (isset($pt->ele)) {
                $ele = (float) $pt->ele;
            }

            $trackpoints[] = [
                'lat' => $lat,
                'lng' => $lon,
                'ele' => $ele,
            ];
        }

        return $trackpoints;
    }

    /**
     * Remove pontos consecutivos com exactamente o mesmo lat/lon
     * (barco parado — frequente em GPX adquiridos por app de telemóvel)
     */
    private function removeDuplicates(array $points): array
    {
        if (empty($points)) {
            return [];
        }

        $clean = [$points[0]];

        for ($i = 1; $i < count($points); $i++) {
            $prev = end($clean);
            if ($points[$i]['lat'] !== $prev['lat'] || $points[$i]['lng'] !== $prev['lng']) {
                $clean[] = $points[$i];
            }
        }

        return $clean;
    }
}
