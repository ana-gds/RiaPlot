<?php
$routes = App\Models\Route::project(['trackpoints' => 0, 'simulation_data' => 0])->get();
echo "n_rotas=" . $routes->count() . "\n";
echo "payload_KB=" . round(strlen($routes->toJson()) / 1024) . "\n";
$first = $routes->first();
echo "tem_trackpoints=" . (isset($first->trackpoints) ? "SIM" : "nao") . "\n";
echo "tem_nome=" . (isset($first->nome) ? "SIM" : "nao") . "\n";
