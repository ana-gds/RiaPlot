<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Services\TideService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SimulacaoController extends Controller
{
    public function __construct(private TideService $tides) {}

    /**
     * POST /api/simulacao/calcular
     *
     * Calcula as cores de navegabilidade de uma rota com base na maré
     * prevista para a data/hora escolhida e nos parâmetros do barco.
     *
     * Body: { route_id, data, hora, calado, folga_superior, folga_inferior }
     */
    public function calcular(Request $request): JsonResponse
    {
        $request->validate([
            'route_id'       => 'required|string',
            'data'           => 'required|date_format:Y-m-d',
            'hora'           => 'required|date_format:H:i',
            'calado'         => 'required|numeric|min:0',
            'folga_superior' => 'numeric|min:0',
            'folga_inferior' => 'numeric|min:0',
        ]);

        $route = Route::find($request->route_id);

        if (!$route) {
            return response()->json(['error' => 'Rota não encontrada.'], 404);
        }

        if (empty($route->sim_file)) {
            return response()->json([
                'error' => 'Esta rota não tem dados de batimetria disponíveis para simulação.',
                'code'  => 'no_sim_data',
            ], 422);
        }

        $trackpoints = is_array($route->trackpoints)
            ? $route->trackpoints
            : iterator_to_array($route->trackpoints);

        if (empty($trackpoints)) {
            return response()->json(['error' => 'Rota sem trackpoints.'], 422);
        }

        $calado   = (float) $request->calado;
        $folgaSup = (float) $request->input('folga_superior', 0.2);
        $folgaInf = (float) $request->input('folga_inferior', 0.1);

        $departure = CarbonImmutable::createFromFormat(
            'Y-m-d H:i',
            $request->data . ' ' . $request->hora,
            config('services.tides.timezone', 'Europe/Lisbon')
        )->utc();

        $tide = $this->tides->levelAt('aveiro', $departure);

        if ($tide === null) {
            return response()->json([
                'error' => 'Sem dados de maré para a data seleccionada.',
                'code'  => 'no_tide_data',
            ], 422);
        }

        $waterLevel = $tide['height'];
        $processed  = [];

        foreach ($trackpoints as $tp) {
            $tp  = is_array($tp) ? $tp : iterator_to_array($tp);
            $lat = (float) ($tp['lat'] ?? 0);
            $lng = (float) ($tp['lng'] ?? 0);
            $ele = isset($tp['ele']) && is_numeric($tp['ele']) ? (float) $tp['ele'] : null;

            if ($ele === null) {
                $processed[] = ['lat' => $lat, 'lng' => $lng, 'color' => 'purple'];
                continue;
            }

            $profReal = $ele + $waterLevel;
            $folga    = $profReal - $calado;

            $processed[] = [
                'lat'        => $lat,
                'lng'        => $lng,
                'z'          => $ele,
                'waterLevel' => round($waterLevel, 3),
                'profReal'   => round($profReal, 3),
                'folga'      => round($folga, 3),
                'color'      => $this->calcularCor($profReal, $folga, $folgaSup, $folgaInf),
            ];
        }

        return response()->json([
            'positions' => $processed,
            'startDate' => $departure->toIso8601String(),
            'calado'    => $calado,
            'folgaSup'  => $folgaSup,
            'folgaInf'  => $folgaInf,
        ]);
    }

    private function calcularCor(float $profReal, float $folga, float $folgaSup, float $folgaInf): string
    {
        if ($profReal <= 0)      return 'black';
        if ($folga <= $folgaInf) return 'red';
        if ($folga <= $folgaSup) return 'yellow';
        return 'green';
    }
}
