<?php

namespace App\Http\Controllers;

use App\Models\Poi;
use Illuminate\Http\JsonResponse;

class PoiController extends Controller
{
    /**
     * GET /api/pois
     * Devolve todos os POIs.
     */
    public function index(): JsonResponse
    {
        $pois = Poi::all()->map(fn($p) => [
            'id'          => $p->_id,
            'name'        => $p->name,
            'coordinates' => $p->coordinates, // [lat, lng]
            'type'        => $p->type,        // 'boia_bombordo' | 'boia_estibordo'
        ]);

        return response()->json($pois);
    }
}
