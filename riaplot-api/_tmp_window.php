<?php
// Investigar a janela temporal do Valida4D.
$svc = app(App\Services\Valida4DService::class);

// 1) Janela dos extremos (ExtremeEvent) para um ponto.
$ex = $svc->extremes(40.645, -8.74);
$first = $ex[0]['datetime'] ?? '-';
$last = $ex ? end($ex)['datetime'] : '-';
echo 'EXTREMES n=' . count($ex) . ' first=' . $first . ' last=' . $last . PHP_EOL;
echo 'agora=' . Carbon\CarbonImmutable::now('UTC')->toIso8601String() . PHP_EOL;

// 2) Execution (níveis) em datas futuras: hoje, +7d, +30d.
foreach ([0, 7, 30] as $d) {
    $dep = Carbon\CarbonImmutable::now('UTC')->addDays($d);
    $pts = [
        ['date' => $dep->toIso8601String(),               'latitude' => 40.645, 'longitude' => -8.74],
        ['date' => $dep->addMinutes(10)->toIso8601String(), 'latitude' => 40.66,  'longitude' => -8.72],
    ];
    try {
        $lv = $svc->levels($pts);
        echo "LEVELS(+{$d}d)=" . json_encode($lv) . PHP_EOL;
    } catch (\Throwable $e) {
        echo "LEVELS(+{$d}d) FALHOU: " . $e->getMessage() . PHP_EOL;
    }
}
