<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Cliente do modelo hidrodinâmico Valida4D da Hidromod.
 *
 * Ao contrário da previsão da FCUL (um único ponto de referência em Aveiro),
 * o Valida4D devolve marés/níveis de água para a coordenada exata pedida —
 * com amplitude e fase a variar ao longo da Ria.
 *
 * O fluxo da API é assíncrono: arranca-se uma execução (Start), faz-se
 * polling ao estado (Status) e, quando concluída, lêem-se os resultados
 * (Results). As horas dos resultados vêm em TU (UTC).
 */
class Valida4DService
{
    private string $base;
    private int $timeout;
    private int $attempts;
    private int $intervalMs;

    public function __construct()
    {
        $this->base       = rtrim((string) config('services.valida4d.base_url'), '/');
        $this->timeout    = (int) config('services.valida4d.timeout', 20);
        $this->attempts   = (int) config('services.valida4d.poll_attempts', 40);
        $this->intervalMs = (int) config('services.valida4d.poll_interval_ms', 400);
    }

    /**
     * Extremos de maré (preia-mar / baixa-mar) para uma coordenada, na janela
     * temporal que o modelo devolve (alguns dias em torno de agora).
     *
     * O `datetime` vai como string ISO-8601 (UTC) — e não como objeto Carbon —
     * para ser seguro guardar/ler da cache sem surpresas de serialização.
     *
     * @return array<int, array{datetime: string, height: float, type: string}>
     *
     * @throws RuntimeException se a API falhar ou não concluir a tempo.
     */
    public function extremes(float $lat, float $lng): array
    {
        $guid = (string) config('services.valida4d.extreme_event_id');
        $data = $this->run('ExtremeEvent', $guid, [
            ['latitude' => $lat, 'longitude' => $lng],
        ]);

        return $this->parseExtremes($data);
    }

    /**
     * Nível de água (m, ZH) em cada ponto espácio-temporal pedido, via modelo
     * Execution. Usado para colorir a navegabilidade de uma rota: cada ponto
     * leva a hora a que o barco lá passa, por isso o nível reflete maré + local.
     *
     * @param  array<int, array{date: string, latitude: float, longitude: float}>  $points
     * @return array<int, float>  níveis alinhados pela ordem dos pontos (pode
     *                            conter sentinelas muito negativas p/ pontos
     *                            fora do domínio do modelo).
     *
     * @throws RuntimeException se a API falhar ou não concluir a tempo.
     */
    public function levels(array $points): array
    {
        if (empty($points)) {
            return [];
        }

        $guid = (string) config('services.valida4d.execution_id');
        $data = $this->run('Execution', $guid, array_values($points));

        return array_map('floatval', $data['values'][0] ?? []);
    }

    /**
     * Arranca uma execução, espera pela conclusão e devolve os resultados.
     *
     * @param  array<int, array<string, mixed>>  $points
     * @return array<string, mixed>
     */
    private function run(string $kind, string $guid, array $points): array
    {
        $start = Http::timeout($this->timeout)
            ->acceptJson()
            ->post("{$this->base}/{$kind}/Start/{$guid}", $points);

        $id = $start->json('id');

        if (!$start->successful() || !$id) {
            throw new RuntimeException("Valida4D {$kind}/Start falhou (HTTP {$start->status()}).");
        }

        $completed = false;

        for ($i = 0; $i < $this->attempts; $i++) {
            $status = (int) Http::timeout($this->timeout)
                ->get("{$this->base}/{$kind}/Status/{$id}")
                ->json('status', 0);

            if ($status === 2) {  // Completed
                $completed = true;
                break;
            }

            if ($status === 3) {  // Failed
                throw new RuntimeException("Valida4D {$kind} falhou (status 3).");
            }

            usleep($this->intervalMs * 1000);
        }

        if (!$completed) {
            throw new RuntimeException("Valida4D {$kind} não concluiu em {$this->attempts} tentativas.");
        }

        $results = Http::timeout($this->timeout)->get("{$this->base}/{$kind}/Results/{$id}");

        if (!$results->successful()) {
            throw new RuntimeException("Valida4D {$kind}/Results falhou (HTTP {$results->status()}).");
        }

        return $results->json() ?? [];
    }

    /**
     * Converte a resposta do ExtremeEvent (1 ponto) em extremos datados.
     *
     * Resposta: { startDate (UTC), dates: [[seg,…]], values: [[altura,…]] }.
     * Os extremos vêm ordenados no tempo e alternam PM/BM, por isso o tipo
     * deduz-se comparando cada altura com as vizinhas (máximo local = PM).
     *
     * @param  array<string, mixed>  $data
     * @return array<int, array{datetime: string, height: float, type: string}>
     */
    private function parseExtremes(array $data): array
    {
        $startDate = CarbonImmutable::parse($data['startDate'])->utc();
        $dates  = $data['dates'][0]  ?? [];
        $values = $data['values'][0] ?? [];
        $n = min(count($dates), count($values));

        $extremos = [];

        for ($k = 0; $k < $n; $k++) {
            $h    = (float) $values[$k];
            $prev = $k > 0      ? (float) $values[$k - 1] : null;
            $next = $k < $n - 1 ? (float) $values[$k + 1] : null;

            $isHigh = ($prev === null || $h >= $prev) && ($next === null || $h >= $next);

            $extremos[] = [
                'datetime' => $startDate->addSeconds((int) round((float) $dates[$k]))->toIso8601String(),
                'height'   => round($h, 2),
                'type'     => $isHigh ? 'PM' : 'BM',
            ];
        }

        return $extremos;
    }
}
