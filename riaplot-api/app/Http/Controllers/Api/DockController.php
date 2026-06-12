<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dock;

class DockController extends Controller
{
    public function index()
    {
        return response()->json(
            Dock::whereNotIn('tipo', ['entroncamento'])
                ->orderBy('nome')
                ->get(['_id', 'routinav_id', 'nome', 'latitude', 'longitude', 'tipo', 'imagem', 'estado'])
        );
    }

    public function show($id)
    {
        return response()->json(Dock::findOrFail($id));
    }
}
