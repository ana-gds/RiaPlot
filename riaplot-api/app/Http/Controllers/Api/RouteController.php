<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    // Lista de rotas (sem path — leve para a lista)
    public function index(Request $request)
    {
        $routes = [
            [
                'id'          => '1',
                'descricao'   => 'Aveiro → Murtosa',
                'distancia'   => 12.4,
                'recomendada' => true,
                'caisPartida' => ['nome' => 'Terminal de Aveiro', 'latitude' => 40.6404, 'longitude' => -8.6538],
                'caisChegada' => ['nome' => 'Cais da Murtosa',    'latitude' => 40.7341, 'longitude' => -8.6253],
            ],
            [
                'id'          => '2',
                'descricao'   => 'Aveiro → Torreira',
                'distancia'   => 18.7,
                'recomendada' => true,
                'caisPartida' => ['nome' => 'Terminal de Aveiro', 'latitude' => 40.6404, 'longitude' => -8.6538],
                'caisChegada' => ['nome' => 'Cais de Torreira',   'latitude' => 40.7637, 'longitude' => -8.6897],
            ],
        ];

        if ($request->query('recomendada') === 'true') {
            $routes = array_filter($routes, fn($r) => $r['recomendada']);
        }

        return response()->json(array_values($routes));
    }

    // Detalhe de uma rota — inclui o path completo
    public function show($id)
    {
        $paths = [
            '1' => [
                ['lat' => 40.6404, 'lng' => -8.6538],
                ['lat' => 40.6600, 'lng' => -8.6600],
                ['lat' => 40.6900, 'lng' => -8.6500],
                ['lat' => 40.7100, 'lng' => -8.6350],
                ['lat' => 40.7341, 'lng' => -8.6253],
            ],
            '2' => [
                ['lat' => 40.6404, 'lng' => -8.6538],
                ['lat' => 40.6700, 'lng' => -8.6700],
                ['lat' => 40.7000, 'lng' => -8.6800],
                ['lat' => 40.7300, 'lng' => -8.6850],
                ['lat' => 40.7637, 'lng' => -8.6897],
            ],
        ];

        if (!isset($paths[$id])) {
            return response()->json(['error' => 'Rota não encontrada'], 404);
        }

        return response()->json([
            'id'          => $id,
            'descricao'   => $id === '1' ? 'Aveiro → Murtosa' : 'Aveiro → Torreira',
            'distancia'   => $id === '1' ? 12.4 : 18.7,
            'path'        => $paths[$id],
        ]);
    }
}
