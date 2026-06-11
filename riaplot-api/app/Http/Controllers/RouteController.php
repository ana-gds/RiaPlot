<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        // A lista de rotas só precisa dos metadados (nome, cais, calado…). Os
        // arrays pesados (`trackpoints` e `simulation_data`) só são necessários
        // no detalhe da rota — excluí-los corta o payload de ~530 KB para ~65 KB.
        $routes = Route::project([
            'trackpoints'     => 0,
            'simulation_data' => 0,
        ])->get();

        return response()->json($routes);
    }

    public function show($id)
    {
        $route = Route::find($id);
        if (!$route) {
            return response()->json(['message' => 'Rota não encontrada'], 404);
        }
        return response()->json($route);
    }

    public function save(Request $request, $id)
    {
        $user = $request->user();
        $saved = $user->saved_routes ?? [];

        if (in_array($id, $saved)) {
            $saved = array_values(array_filter($saved, fn ($r) => $r !== $id));
            $user->update(['saved_routes' => $saved]);
            return response()->json(['message' => 'Rota removida', 'saved' => false, 'saved_routes' => $saved]);
        }

        $saved[] = $id;
        $user->update(['saved_routes' => $saved]);

        return response()->json(['message' => 'Rota guardada', 'saved' => true, 'saved_routes' => $saved]);
    }
}
