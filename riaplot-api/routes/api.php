<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DockController;
use App\Http\Controllers\Api\RouteController;

Route::get('/docks',        [DockController::class,  'index']);
Route::get('/routes',       [RouteController::class, 'index']);
Route::get('/routes/{id}',  [RouteController::class, 'show']);
