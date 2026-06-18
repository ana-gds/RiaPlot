<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Pré-calcula diariamente a maré dos pontos de referência da Ria, para o
// painel responder de forma instantânea (ver TideController@local).
Schedule::command('tides:refresh-points')->dailyAt('04:30');
