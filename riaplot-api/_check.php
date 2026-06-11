<?php
$routes = App\Models\Route::project(['trackpoints' => 0, 'simulation_data' => 0])->get();
$comFoto = $routes->filter(fn ($r) => !empty($r->image_url))->count();
$processadas = $routes->filter(fn ($r) => !is_null($r->image_url))->count();
echo "total=" . $routes->count() . "\n";
echo "com_foto=" . $comFoto . "\n";
echo "ja_processadas=" . $processadas . "\n";
echo "payload_KB=" . round(strlen($routes->toJson()) / 1024) . "\n";
$exemplo = $routes->first(fn ($r) => !empty($r->image_url));
echo "exemplo_url=" . ($exemplo->image_url ?? "-") . "\n";
