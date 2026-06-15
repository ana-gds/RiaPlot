<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

/**
 * SimulacaoController
 *
 * Proxy seguro entre o React e a API SiSMAR/Valida4D da Hidromod.
 * O React nunca chama a Hidromod directamente — passa sempre por aqui.
 *
 * Endpoints expostos:
 *   POST /api/simulacao/iniciar       → inicia execução na Hidromod
 *   GET  /api/simulacao/{id}/status   → polling do estado
 *   GET  /api/simulacao/{id}/dados    → resultados finais
 *   DELETE /api/simulacao/{id}        → cleanup
 *   POST /api/simulacao/mares         → preia/baixa-mar (PM/BM)
 *   GET  /api/simulacao/mares/{id}/status
 *   GET  /api/simulacao/mares/{id}/dados
 *
 * Variáveis de ambiente necessárias (.env):
 *   SISMAR_BASE_URL=https://sismarservices.hidromod.com/reader
 *   SISMAR_INITIAL_ID=<descobrir no Swagger UI>
 *   SISMAR_TIMEOUT=30
 */
class SimulacaoController extends Controller
{
    private string $baseUrl;
    private int    $initialId;
    private int    $timeout;

    public function __construct()
    {
        $this->baseUrl   = rtrim(config('services.sismar.base_url'), '/');
        $this->initialId = (int) config('services.sismar.initial_id');
        $this->timeout   = (int) config('services.sismar.timeout', 30);
    }

    // -------------------------------------------------------------------------
    // EXECUÇÃO — nível de água ao longo da rota
    // -------------------------------------------------------------------------

    /**
     * POST /api/simulacao/iniciar
     *
     * Body esperado:
     * {
     *   "pontos": [{"latitude": 40.612, "longitude": -8.737}, ...],
     *   "data":   "2026-06-10",    // YYYY-MM-DD
     *   "hora":   "14:30"          // HH:MM (hora de partida)
     * }
     *
     * Devolve: { "executionId": "abc-123..." }
     */
    public function iniciar(Request $request)
    {
        if ($this->initialId <= 0) {
            return $this->erroConfiguracao();
        }

        $request->validate([
            'pontos'          => 'required|array|min:2',
            'pontos.*.latitude'  => 'required|numeric',
            'pontos.*.longitude' => 'required|numeric',
            'data'            => 'required|date_format:Y-m-d',
            'hora'            => 'required|date_format:H:i',
        ]);

        // Chave de cache: hash da rota + data + hora
        $cacheKey = 'simulacao_' . md5(json_encode($request->pontos) . $request->data . $request->hora);

        // Se já temos resultados em cache, devolvemos o executionId guardado
        if (Cache::has($cacheKey . '_result')) {
            return response()->json([
                'executionId' => Cache::get($cacheKey . '_id'),
                'cached'      => true,
            ]);
        }

        $startDatetime = $request->data . 'T' . $request->hora . ':00';

        // A Hidromod espera um array de {latitude, longitude}
        $payload = $request->pontos;

        $response = Http::timeout($this->timeout)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/Execution/Start/{$this->initialId}", $payload);

        if ($response->failed()) {
            return response()->json([
                'error'   => 'Falha ao iniciar simulação na API Hidromod',
                'details' => $response->body(),
            ], 502);
        }

        $executionId = $response->json('executionId') ?? $response->body();

        // Guarda o id e a chave de cache para recuperar depois
        Cache::put($cacheKey . '_id', $executionId, now()->addHour());

        return response()->json(['executionId' => $executionId]);
    }

    /**
     * GET /api/simulacao/{id}/status
     *
     * Devolve: { "status": 0|1|2 }
     *   0 = em fila
     *   1 = a correr
     *   2 = concluído
     */
    public function status(string $id)
    {
        $response = Http::timeout($this->timeout)
            ->get("{$this->baseUrl}/Execution/Status/{$id}");

        if ($response->failed()) {
            return response()->json(['error' => 'Erro ao verificar estado'], 502);
        }

        return response()->json($response->json());
    }

    /**
     * GET /api/simulacao/{id}/dados
     *
     * Devolve o resultado processado para o React:
     * {
     *   "positions": [{"lat": ..., "lng": ..., "z": ..., "waterLevel": ..., "color": "green|yellow|red|black"}, ...]
     * }
     */
    public function dados(Request $request, string $id)
    {
        // Parâmetros do barco (passados como query string ou body)
        $calado       = (float) $request->query('calado', 1.0);
        $folgaSup     = (float) $request->query('folga_superior', 0.2);
        $folgaInf     = (float) $request->query('folga_inferior', 0.1);

        // Cache dos resultados por executionId + parâmetros do barco
        $cacheKey = "result_{$id}_{$calado}_{$folgaSup}_{$folgaInf}";

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $response = Http::timeout($this->timeout)
            ->get("{$this->baseUrl}/Execution/Results/{$id}");

        if ($response->failed()) {
            return response()->json(['error' => 'Erro ao obter resultados'], 502);
        }

        $raw = $response->json();

        // Processar e colorir os pontos
        $processed = $this->processarResultados($raw, $calado, $folgaSup, $folgaInf);

        // Cache por 1 hora (resultados para a mesma rota+data não mudam)
        Cache::put($cacheKey, $processed, now()->addHour());

        // Cleanup assíncrono (fire-and-forget)
        Http::timeout(5)->delete("{$this->baseUrl}/Execution/Delete/{$id}");

        return response()->json($processed);
    }

    /**
     * DELETE /api/simulacao/{id}
     * Cleanup manual (opcional — o dados() já faz automaticamente)
     */
    public function apagar(string $id)
    {
        $response = Http::timeout($this->timeout)
            ->delete("{$this->baseUrl}/Execution/Delete/{$id}");

        return response()->json(['deleted' => $response->successful()]);
    }

    // -------------------------------------------------------------------------
    // EVENTOS EXTREMOS — preia-mar e baixa-mar (PM/BM)
    // -------------------------------------------------------------------------

    /**
     * POST /api/simulacao/mares
     * Inicia cálculo de PM/BM para os próximos 4 dias.
     *
     * Body: { "latitude": 40.64, "longitude": -8.73 }
     * Devolve: { "executionId": "..." }
     */
    public function maresIniciar(Request $request)
    {
        if ($this->initialId <= 0) {
            return $this->erroConfiguracao();
        }

        $request->validate([
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Cache diário — PM/BM do dia não muda
        $cacheKey = 'mares_' . date('Y-m-d') . '_' . round($request->latitude, 3) . '_' . round($request->longitude, 3);

        if (Cache::has($cacheKey)) {
            return response()->json([
                'executionId' => Cache::get($cacheKey),
                'cached'      => true,
            ]);
        }

        $payload = [['latitude' => $request->latitude, 'longitude' => $request->longitude]];

        $response = Http::timeout($this->timeout)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/ExtremeEvent/Start/{$this->initialId}", $payload);

        if ($response->failed()) {
            return response()->json(['error' => 'Falha ao iniciar cálculo de marés'], 502);
        }

        $executionId = $response->json('executionId') ?? $response->body();
        Cache::put($cacheKey, $executionId, now()->addDay());

        return response()->json(['executionId' => $executionId]);
    }

    /**
     * GET /api/simulacao/mares/{id}/status
     */
    public function maresStatus(string $id)
    {
        $response = Http::timeout($this->timeout)
            ->get("{$this->baseUrl}/ExtremeEvent/Status/{$id}");

        if ($response->failed()) {
            return response()->json(['error' => 'Erro ao verificar estado das marés'], 502);
        }

        return response()->json($response->json());
    }

    /**
     * GET /api/simulacao/mares/{id}/dados
     *
     * Devolve os 16 timestamps de PM/BM (4 dias × 4 eventos):
     * {
     *   "eventos": [
     *     { "tipo": "PM", "datetime": "2026-06-10T10:23:00", "altura": 3.21 },
     *     { "tipo": "BM", "datetime": "2026-06-10T16:45:00", "altura": 0.45 },
     *     ...
     *   ]
     * }
     */
    public function maresDados(string $id)
    {
        $cacheKey = "mares_result_{$id}";

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $response = Http::timeout($this->timeout)
            ->get("{$this->baseUrl}/ExtremeEvent/Results/{$id}");

        if ($response->failed()) {
            return response()->json(['error' => 'Erro ao obter dados de marés'], 502);
        }

        $raw = $response->json();

        // A Hidromod devolve dates[0] com 16 timestamps relativos
        // e values com as alturas correspondentes
        $processed = $this->processarMares($raw);

        Cache::put($cacheKey, $processed, now()->addDay());

        return response()->json($processed);
    }

    /**
     * Resposta de erro quando o SISMAR_INITIAL_ID não está configurado no .env.
     * Evita chamadas silenciosas a /Execution/Start/0 que devolvem 502 confusos.
     */
    private function erroConfiguracao()
    {
        return response()->json([
            'error' => 'Simulação indisponível: SISMAR_INITIAL_ID não está configurado no servidor.',
        ], 503);
    }

    // -------------------------------------------------------------------------
    // Processamento interno
    // -------------------------------------------------------------------------

    /**
     * Transforma a resposta bruta da Hidromod em pontos com cor calculada.
     *
     * Formato da resposta Hidromod (confirmado nos v_*.json do Routinav):
     * {
     *   "startDate": "2026-06-10T14:30:00",
     *   "dates": [0, -1, -2, ...],         // segundos relativos ao startDate
     *   "positions": [{"x": lat, "y": lng, "z": profundidade_base}, ...],
     *   "parameters": ["water_level"],
     *   "values": [[2.59, 2.58, ...]]       // valores de nível de água por ponto
     * }
     */
    private function processarResultados(array $raw, float $calado, float $folgaSup, float $folgaInf): array
    {
        $positions  = $raw['positions'] ?? [];
        $waterLevels = $raw['values'][0] ?? [];

        if (empty($positions) || empty($waterLevels)) {
            return ['positions' => [], 'error' => 'Sem dados da API'];
        }

        $processed = [];

        foreach ($positions as $i => $pos) {
            $z          = (float) ($pos['z'] ?? 0);   // profundidade base (batimetria)
            $waterLevel = (float) ($waterLevels[$i] ?? 0); // nível de água simulado
            $lat        = (float) ($pos['x'] ?? 0);
            $lng        = (float) ($pos['y'] ?? 0);

            // Profundidade real = batimetria + variação de maré
            $profReal = $z + $waterLevel;

            // Folga = espaço entre o fundo e a quilha
            $folga = $profReal - $calado;

            // Classificação de cor
            $color = $this->calcularCor($profReal, $folga, $folgaSup, $folgaInf);

            $processed[] = [
                'lat'        => $lat,
                'lng'        => $lng,
                'z'          => $z,
                'waterLevel' => $waterLevel,
                'profReal'   => round($profReal, 3),
                'folga'      => round($folga, 3),
                'color'      => $color,
            ];
        }

        return [
            'positions'  => $processed,
            'startDate'  => $raw['startDate'] ?? null,
            'calado'     => $calado,
            'folgaSup'   => $folgaSup,
            'folgaInf'   => $folgaInf,
        ];
    }

    /**
     * Lógica de cor (documentada no Roadmap, Fase 5.4):
     *
     * ⚫ Preto   : profundidade real ≤ 0 (sequeiro)
     * 🔴 Vermelho: folga ≤ folgaInferior (vai encalhar)
     * 🟡 Amarelo : folgaInferior < folga ≤ folgaSuperior (atenção)
     * 🟢 Verde   : folga > folgaSuperior (seguro)
     */
    private function calcularCor(float $profReal, float $folga, float $folgaSup, float $folgaInf): string
    {
        if ($profReal <= 0) {
            return 'black';   // sequeiro / baixio
        }

        if ($folga <= $folgaInf) {
            return 'red';     // encalha
        }

        if ($folga <= $folgaSup) {
            return 'yellow';  // atenção
        }

        return 'green';       // seguro
    }

    /**
     * Transforma os eventos extremos da Hidromod num array legível.
     * A API devolve dates[0] com 16 timestamps e values com as alturas.
     */
    private function processarMares(array $raw): array
    {
        $startDate = $raw['startDate'] ?? now()->toIso8601String();
        $dates     = $raw['dates'][0]  ?? [];
        $heights   = $raw['values'][0] ?? [];

        $startTimestamp = strtotime($startDate);
        $eventos = [];

        foreach ($dates as $i => $offset) {
            $timestamp = $startTimestamp + (int) $offset;
            $altura    = isset($heights[$i]) ? round((float) $heights[$i], 2) : null;

            // PM = preia-mar (altura alta), BM = baixa-mar
            // Determinar tipo pelo índice: 0=PM, 1=BM, 2=PM, 3=BM, ...
            $tipo = ($i % 2 === 0) ? 'PM' : 'BM';

            $eventos[] = [
                'tipo'     => $tipo,
                'datetime' => date('Y-m-d\TH:i:s', $timestamp),
                'altura'   => $altura,
            ];
        }

        return ['eventos' => $eventos];
    }
}
