<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Tide;
use Carbon\CarbonImmutable;

/**
 * Importa a tabela anual de marés da FCUL (Aveiro) para a coleção `tides`.
 *
 * Os ficheiros têm uma linha por extremo (preia-mar / baixa-mar):
 *
 *     2026-01-01   0:49  3.32  Preia-Mar
 *     2026-01-01   6:50  1.12  Baixa-Mar
 *
 * As horas estão em TU (UTC) e as alturas referidas ao Zero Hidrográfico.
 *
 * Uso:
 *   php artisan tides:import                 # Aveiro, ano atual
 *   php artisan tides:import --year=2027
 *   php artisan tides:import --port=aveiro --year=2026
 */
class ImportTides extends Command
{
    protected $signature = 'tides:import
                            {--port=aveiro : Identificador do porto}
                            {--year= : Ano a importar (por omissão, o ano atual)}';

    protected $description = 'Importa a previsão anual de marés da FCUL para a coleção tides';

    public function handle(): int
    {
        $port = strtolower((string) $this->option('port'));
        $year = (int) ($this->option('year') ?: date('Y'));

        // O ficheiro FCUL usa o nome do porto capitalizado (ex: AveiroFCUL2026.TXT).
        $url = str_replace(
            ['{port}', '{year}'],
            [ucfirst($port), $year],
            config('services.tides.fcul_url_template')
        );

        $this->info("A descarregar marés de {$port} ({$year})...");
        $this->line("  {$url}");

        $response = Http::timeout(30)->get($url);

        if (!$response->successful()) {
            $this->error("Falha ao descarregar (HTTP {$response->status()}).");
            return self::FAILURE;
        }

        // Os ficheiros vêm em Windows-1252; as linhas de dados são ASCII, por
        // isso convertemos para evitar problemas com o cabeçalho acentuado.
        $body = mb_convert_encoding($response->body(), 'UTF-8', 'Windows-1252');

        $extremos = $this->parse($body, $port);

        if (empty($extremos)) {
            $this->error('Nenhum extremo de maré reconhecido no ficheiro.');
            return self::FAILURE;
        }

        // Substitui os dados existentes desse porto/ano (idempotente).
        $inicio = CarbonImmutable::create($year, 1, 1, 0, 0, 0, 'UTC');
        $fim    = $inicio->addYear();
        $removidos = Tide::where('port', $port)
            ->where('datetime', '>=', $inicio)
            ->where('datetime', '<', $fim)
            ->delete();

        foreach (array_chunk($extremos, 500) as $chunk) {
            Tide::insert($chunk);
        }

        $this->info(sprintf(
            'Importados %d extremos de maré (%d removidos do ano anterior à importação).',
            count($extremos),
            $removidos
        ));

        return self::SUCCESS;
    }

    /**
     * Extrai os extremos de maré das linhas do ficheiro.
     *
     * @return array<int, array{port:string, datetime:\DateTime, height:float, type:string}>
     */
    private function parse(string $body, string $port): array
    {
        $extremos = [];

        // Ex: "2026-01-01   0:49  3.32  Preia-Mar"
        $regex = '/^\s*(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s+([\d.]+)\s+(Preia-Mar|Baixa-Mar)/u';

        foreach (preg_split('/\r\n|\r|\n/', $body) as $line) {
            if (!preg_match($regex, $line, $m)) {
                continue;
            }

            [, $date, $time, $height, $tipo] = $m;

            // Ficheiro em TU (UTC).
            $dt = CarbonImmutable::createFromFormat('Y-m-d G:i', "{$date} {$time}", 'UTC');

            $extremos[] = [
                'port'     => $port,
                'datetime' => $dt->toDateTime(),
                'height'   => (float) $height,
                'type'     => $tipo === 'Preia-Mar' ? 'PM' : 'BM',
            ];
        }

        return $extremos;
    }
}
