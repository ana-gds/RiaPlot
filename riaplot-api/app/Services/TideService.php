<?php

namespace App\Services;

use App\Models\Tide;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Cálculo do nível de maré num instante arbitrário, a partir dos extremos
 * (preia-mar / baixa-mar) importados da FCUL.
 *
 * Entre dois extremos consecutivos a maré aproxima-se bem por uma curva
 * cossenoidal (equivalente suave à "regra dos doze avos"):
 *
 *     h(t) = h1 + (h2 - h1) * (1 - cos(pi * frac)) / 2,   frac = (t-t1)/(t2-t1)
 *
 * O resultado está em metros, referido ao Zero Hidrográfico.
 */
class TideService
{
    /**
     * Nível interpolado da maré num instante, ou null se não houver extremos
     * que envolvam esse instante (ex: ano por importar).
     *
     * @return array{
     *   height: float, rising: bool,
     *   previous: array{datetime: CarbonImmutable, height: float, type: string},
     *   next: array{datetime: CarbonImmutable, height: float, type: string}
     * }|null
     */
    public function levelAt(string $port, CarbonInterface $instant): ?array
    {
        $instant = CarbonImmutable::instance($instant)->utc();

        $previous = Tide::where('port', $port)
            ->where('datetime', '<=', $instant)
            ->orderBy('datetime', 'desc')
            ->first();

        $next = Tide::where('port', $port)
            ->where('datetime', '>', $instant)
            ->orderBy('datetime', 'asc')
            ->first();

        if (!$previous || !$next) {
            return null;
        }

        $t1 = CarbonImmutable::instance($previous->datetime)->utc();
        $t2 = CarbonImmutable::instance($next->datetime)->utc();
        $h1 = (float) $previous->height;
        $h2 = (float) $next->height;

        $span = $t2->getTimestamp() - $t1->getTimestamp();
        $frac = $span > 0 ? ($instant->getTimestamp() - $t1->getTimestamp()) / $span : 0.0;

        $height = $h1 + ($h2 - $h1) * (1 - cos(M_PI * $frac)) / 2;

        return [
            'height'   => round($height, 2),
            'rising'   => $next->type === 'PM', // a subir se o próximo extremo é preia-mar
            'previous' => ['datetime' => $t1, 'height' => $h1, 'type' => $previous->type],
            'next'     => ['datetime' => $t2, 'height' => $h2, 'type' => $next->type],
        ];
    }
}
