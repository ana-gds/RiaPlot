<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Services\Valida4DService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SimulacaoController extends Controller
{
    // Velocidade assumida (nós) quando o barco não a tem definida — só serve
    // para datar cada ponto da rota (a que horas o barco lá passa).
    private const VELOCIDADE_PADRAO_NOS = 5.0;

    // Sentinela do Valida4D para pontos fora do domínio do modelo.
    private const SEM_DADOS = -100.0;

    public function __construct(private Valida4DService $valida4d) {}

    /**
     * POST /api/simulacao/calcular
     *
     * Calcula as cores de navegabilidade de uma rota. O nível de água é obtido
     * ponto-a-ponto no modelo Valida4D (varia com o local E com a hora a que o
     * barco lá passa). Se o Valida4D falhar, devolve erro (sem dados de maré).
     *
     * Body: { route_id, data, hora, calado, folga_superior, folga_inferior, velocidade? }
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
            'velocidade'     => 'nullable|numeric|min:0.1',
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
        $velocidade = (float) ($request->input('velocidade') ?: self::VELOCIDADE_PADRAO_NOS);

        $departure = CarbonImmutable::createFromFormat(
            'Y-m-d H:i',
            $request->data . ' ' . $request->hora,
            config('tides.timezone', 'Europe/Lisbon')
        )->utc();

        // Nível de água por ponto (Valida4D), datando cada ponto pela hora a que
        // o barco lá passa.
        [$levels, $source] = $this->waterLevels($trackpoints, $departure, $velocidade);

        if ($levels === null) {
            return response()->json([
                'error' => 'Sem dados de maré do Valida4D para a data seleccionada.',
                'code'  => 'no_tide_data',
            ], 422);
        }

        $processed = [];

        foreach (array_values($trackpoints) as $i => $tp) {
            $tp  = is_array($tp) ? $tp : iterator_to_array($tp);
            $lat = (float) ($tp['lat'] ?? 0);
            $lng = (float) ($tp['lng'] ?? 0);
            $ele = isset($tp['ele']) && is_numeric($tp['ele']) ? (float) $tp['ele'] : null;

            $waterLevel = $levels[$i] ?? null;

            // Sem batimetria, ou ponto fora do domínio do modelo → roxo.
            if ($ele === null || $waterLevel === null || $waterLevel <= self::SEM_DADOS) {
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
            'source'    => $source,
        ]);
    }

    /**
     * Nível de água por ponto, via Valida4D, datando cada ponto pela hora a que
     * o barco lá passa (distância acumulada ÷ velocidade). Devolve
     * [array<float>|null, source]: null se o Valida4D falhar ou os níveis não
     * alinharem com os pontos (→ o chamador devolve erro 'no_tide_data').
     */
    private function waterLevels(array $trackpoints, CarbonImmutable $departure, float $velocidadeNos): array
    {
        $velocidadeMs = max(0.1, $velocidadeNos) * 0.514444; // nós → m/s

        $points = [];
        $cum = 0.0;
        $prev = null;

        foreach (array_values($trackpoints) as $tp) {
            $tp  = is_array($tp) ? $tp : iterator_to_array($tp);
            $lat = (float) ($tp['lat'] ?? 0);
            $lng = (float) ($tp['lng'] ?? 0);

            if ($prev !== null) {
                $cum += $this->haversine($prev[0], $prev[1], $lat, $lng);
            }
            $prev = [$lat, $lng];

            $points[] = [
                'date'      => $departure->addSeconds((int) round($cum / $velocidadeMs))->toIso8601String(),
                'latitude'  => $lat,
                'longitude' => $lng,
            ];
        }

        try {
            $levels = $this->valida4d->levels($points);

            // Tem de haver um nível por ponto, senão não dá para alinhar.
            if (count($levels) !== count($points)) {
                return [null, 'unavailable'];
            }

            return [$levels, 'valida4d'];
        } catch (\Throwable $e) {
            report($e);

            return [null, 'unavailable'];
        }
    }

    /** Distância em metros entre duas coordenadas (fórmula de haversine). */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 6_371_000 * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function calcularCor(float $profReal, float $folga, float $folgaSup, float $folgaInf): string
    {
        if ($profReal <= 0)      return 'black';
        if ($folga <= $folgaInf) return 'red';
        if ($folga <= $folgaSup) return 'yellow';
        return 'green';
    }
}
