<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TidePoint;
use App\Services\Valida4DService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Marés da Ria de Aveiro (modelo hidrodinâmico Valida4D da Hidromod).
 *
 *   GET /api/tides/current   → nível interpolado agora + extremos envolventes
 *   GET /api/tides           → extremos (PM/BM) de um dia
 *   GET /api/tides/local     → extremos do dia para a coordenada (ponto + agora)
 *
 * As marés variam de sítio para sítio na Ria. Os dados vêm dos pontos de
 * referência pré-calculados (`tide_points`, comando tides:refresh-points); para
 * coordenadas arbitrárias, do ponto mais próximo ou de um cálculo ao vivo.
 * As horas são devolvidas em hora legal portuguesa (Europe/Lisbon).
 */
class TideController extends Controller
{
    public function __construct(private Valida4DService $valida4d) {}

    private function timezone(): string
    {
        return config('tides.timezone', 'Europe/Lisbon');
    }

    /**
     * GET /api/tides/current?port=aveiro
     *
     * Nível interpolado AGORA + extremos envolventes, num ponto de referência
     * (o `port` mapeia para a key do ponto; por omissão Aveiro).
     */
    public function current(Request $request)
    {
        $port = strtolower($request->query('port', 'aveiro'));
        $tz   = $this->timezone();

        $point   = $this->pointForPort($port);
        $payload = $point ? $this->currentFromExtremes($point->extremes ?? [], $tz) : null;

        if ($payload === null) {
            return response()->json([
                'message' => "Sem dados de maré para '{$port}'.",
            ], 503);
        }

        return response()->json(array_merge([
            'port'     => $point->key ?? $port,
            'datetime' => CarbonImmutable::now($tz)->toIso8601String(),
            'unidade'  => 'm',
            'datum'    => 'ZH',
        ], $payload));
    }

    /**
     * GET /api/tides?port=aveiro&date=YYYY-MM-DD
     * Extremos (preia/baixa-mar) do dia indicado (por omissão, hoje).
     */
    public function index(Request $request)
    {
        $port = strtolower($request->query('port', 'aveiro'));
        $tz   = $this->timezone();

        $day = $request->query('date')
            ? CarbonImmutable::createFromFormat('Y-m-d', $request->query('date'), $tz)->startOfDay()
            : CarbonImmutable::now($tz)->startOfDay();

        $start = $day->utc();
        $end   = $day->addDay()->utc();

        $point = $this->pointForPort($port);
        $tides = $point
            ? $this->extremesForDay($point->extremes ?? [], $start, $end, $tz)
            : collect();

        return response()->json([
            'port'  => $point->key ?? $port,
            'date'  => $day->toDateString(),
            'tides' => $tides->values(),
        ]);
    }

    /**
     * GET /api/tides/local?lat=..&lng=..&date=YYYY-MM-DD
     *
     * Extremos do dia + nível atual para a COORDENADA — as marés variam de sítio
     * para sítio. Estratégia, por ordem:
     *   1. Ponto de referência pré-calculado mais próximo (instantâneo).
     *   2. Cálculo Valida4D ao vivo (com cache) — se não houver ponto útil.
     * Sem dados, devolve listas vazias (o painel mostra "indisponível").
     */
    public function local(Request $request)
    {
        $data = $request->validate([
            'lat'  => 'required|numeric|between:-90,90',
            'lng'  => 'required|numeric|between:-180,180',
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $tz  = $this->timezone();
        $lat = (float) $data['lat'];
        $lng = (float) $data['lng'];
        // Arredonda para ~100 m: estabiliza a chave de cache e evita pedidos a
        // cada pequeno arrasto do mapa (a maré não muda nessa escala).
        $latR = round($lat, 3);
        $lngR = round($lng, 3);

        $day = !empty($data['date'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $data['date'], $tz)->startOfDay()
            : CarbonImmutable::now($tz)->startOfDay();

        $start = $day->utc();
        $end   = $day->addDay()->utc();

        // 1) Ponto pré-calculado mais próximo (instantâneo, sem chamar a Hidromod).
        if ($point = $this->nearestPoint($lat, $lng)) {
            $tides = $this->extremesForDay($point->extremes ?? [], $start, $end, $tz);

            if ($tides->isNotEmpty()) {
                return response()->json([
                    'lat'    => $latR,
                    'lng'    => $lngR,
                    'date'   => $day->toDateString(),
                    'unidade' => 'm',
                    'datum'  => 'ZH',
                    'source' => 'valida4d',
                    'point'  => ['key' => $point->key, 'name' => $point->name],
                    'now'    => $this->interpolateNow($point->extremes ?? []),
                    'tides'  => $tides,
                ]);
            }
        }

        // 2) Sem ponto útil → cálculo ao vivo com cache.
        try {
            $extremos = Cache::remember(
                "valida4d_tides_{$latR}_{$lngR}",
                now()->addHours((int) config('services.valida4d.cache_hours', 6)),
                fn () => $this->valida4d->extremes($latR, $lngR)
            );

            $tides = $this->extremesForDay($extremos, $start, $end, $tz);

            return response()->json([
                'lat'    => $latR,
                'lng'    => $lngR,
                'date'   => $day->toDateString(),
                'unidade' => 'm',
                'datum'  => 'ZH',
                'source' => $tides->isEmpty() ? 'unavailable' : 'valida4d',
                'now'    => $this->interpolateNow($extremos),
                'tides'  => $tides,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'lat'    => $latR,
                'lng'    => $lngR,
                'date'   => $day->toDateString(),
                'unidade' => 'm',
                'datum'  => 'ZH',
                'source' => 'unavailable',
                'now'    => null,
                'tides'  => [],
            ]);
        }
    }

    /**
     * Ponto de referência de um "port" (compat. com ?port=aveiro): por key, ou
     * o mais próximo de Aveiro se a key não existir.
     */
    private function pointForPort(string $port): ?TidePoint
    {
        return TidePoint::where('key', $port)->first()
            ?? $this->nearestPoint(40.6405, -8.6560);
    }

    /**
     * Ponto de referência pré-calculado mais próximo da coordenada, ignorando
     * pontos demasiado antigos (rede de segurança se o agendamento falhar).
     */
    private function nearestPoint(float $lat, float $lng): ?TidePoint
    {
        $cutoff = now()->subHours((int) config('tides.point_max_age_hours', 36));

        $best = null;
        $bestDist = INF;

        foreach (TidePoint::all() as $pt) {
            if ($pt->computed_at && $pt->computed_at->lt($cutoff)) {
                continue;
            }

            $dist = $this->haversine($lat, $lng, (float) $pt->lat, (float) $pt->lng);

            if ($dist < $bestDist) {
                $bestDist = $dist;
                $best = $pt;
            }
        }

        return $best;
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

    /**
     * Filtra extremos (datetime em ISO) ao dia local pedido e formata-os.
     *
     * @param  array<int, array{datetime: string, height: float, type: string}>  $extremos
     */
    private function extremesForDay(array $extremos, CarbonImmutable $start, CarbonImmutable $end, string $tz)
    {
        return collect($extremos)
            ->map(fn ($e) => [
                'datetime' => CarbonImmutable::parse($e['datetime'])->utc(),
                'height'   => $e['height'],
                'type'     => $e['type'],
            ])
            ->filter(fn ($e) => $e['datetime'] >= $start && $e['datetime'] < $end)
            ->map(fn ($e) => $this->formatExtreme($e, $tz))
            ->values();
    }

    /**
     * Nível interpolado AGORA + extremos envolventes (formatados), a partir dos
     * extremos de um ponto. Entre dois extremos a maré aproxima-se por uma
     * cossenoide. Devolve null se "agora" não estiver entre dois extremos.
     *
     * @param  array<int, array{datetime: string, height: float, type: string}>  $extremos
     * @return array{height: float, rising: bool, previous: array, next: array}|null
     */
    private function currentFromExtremes(array $extremos, string $tz): ?array
    {
        $now  = CarbonImmutable::now('UTC');
        $prev = null;
        $next = null;

        foreach ($extremos as $e) {
            $entry = [
                'datetime' => CarbonImmutable::parse($e['datetime'])->utc(),
                'height'   => (float) $e['height'],
                'type'     => $e['type'],
            ];

            if ($entry['datetime']->lessThanOrEqualTo($now)) {
                if ($prev === null || $entry['datetime']->greaterThan($prev['datetime'])) {
                    $prev = $entry;
                }
            } elseif ($next === null || $entry['datetime']->lessThan($next['datetime'])) {
                $next = $entry;
            }
        }

        if (!$prev || !$next) {
            return null;
        }

        $span = $next['datetime']->getTimestamp() - $prev['datetime']->getTimestamp();
        $frac = $span > 0 ? ($now->getTimestamp() - $prev['datetime']->getTimestamp()) / $span : 0.0;
        $height = $prev['height'] + ($next['height'] - $prev['height']) * (1 - cos(M_PI * $frac)) / 2;

        return [
            'height'   => round($height, 2),
            'rising'   => $next['type'] === 'PM', // sobe se o próximo extremo é preia-mar
            'previous' => $this->formatExtreme($prev, $tz),
            'next'     => $this->formatExtreme($next, $tz),
        ];
    }

    /**
     * Só o nível instantâneo (height + rising) — para o campo `now` do painel.
     *
     * @param  array<int, array{datetime: string, height: float, type: string}>  $extremos
     * @return array{height: float, rising: bool}|null
     */
    private function interpolateNow(array $extremos): ?array
    {
        $c = $this->currentFromExtremes($extremos, $this->timezone());

        return $c ? ['height' => $c['height'], 'rising' => $c['rising']] : null;
    }

    /**
     * Formata um extremo para a resposta: hora legal + instante UTC + altura/tipo.
     */
    private function formatExtreme(array $extreme, string $tz): array
    {
        $local = $extreme['datetime']->setTimezone($tz);

        return [
            'type'   => $extreme['type'], // PM | BM
            'label'  => $extreme['type'] === 'PM' ? 'Preia-Mar' : 'Baixa-Mar',
            'time'   => $local->format('H:i'),
            'datetime_utc' => $extreme['datetime']->toIso8601String(),
            'height' => round((float) $extreme['height'], 2),
        ];
    }
}
