<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tide;
use App\Services\TideService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

/**
 * Marés do porto (previsão FCUL/IH).
 *
 *   GET /api/tides/current   → nível interpolado agora + extremos envolventes
 *   GET /api/tides           → extremos (PM/BM) de um dia
 *
 * As horas são devolvidas já em hora legal portuguesa (Europe/Lisbon),
 * com o instante UTC original também disponível para o cliente.
 */
class TideController extends Controller
{
    public function __construct(private TideService $tides) {}

    private function timezone(): string
    {
        return config('services.tides.timezone', 'Europe/Lisbon');
    }

    /**
     * GET /api/tides/current?port=aveiro
     */
    public function current(Request $request)
    {
        $port = strtolower($request->query('port', 'aveiro'));
        $tz   = $this->timezone();

        $level = $this->tides->levelAt($port, CarbonImmutable::now('UTC'));

        if ($level === null) {
            return response()->json([
                'message' => "Sem dados de maré para '{$port}'. Corre: php artisan tides:import.",
            ], 503);
        }

        return response()->json([
            'port'     => $port,
            'datetime' => CarbonImmutable::now($tz)->toIso8601String(),
            'height'   => $level['height'],
            'rising'   => $level['rising'],
            'unidade'  => 'm',
            'datum'    => 'ZH', // Zero Hidrográfico
            'previous' => $this->formatExtreme($level['previous'], $tz),
            'next'     => $this->formatExtreme($level['next'], $tz),
        ]);
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

        // Intervalo do dia local, convertido para UTC (como está guardado).
        $start = $day->utc();
        $end   = $day->addDay()->utc();

        $extremos = Tide::where('port', $port)
            ->where('datetime', '>=', $start)
            ->where('datetime', '<', $end)
            ->orderBy('datetime', 'asc')
            ->get()
            ->map(fn (Tide $t) => $this->formatExtreme([
                'datetime' => CarbonImmutable::instance($t->datetime)->utc(),
                'height'   => (float) $t->height,
                'type'     => $t->type,
            ], $tz));

        return response()->json([
            'port'  => $port,
            'date'  => $day->toDateString(),
            'tides' => $extremos->values(),
        ]);
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
