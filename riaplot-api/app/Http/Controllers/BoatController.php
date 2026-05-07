<?php

namespace App\Http\Controllers;

use App\Models\Boat;
use Illuminate\Http\Request;

class BoatController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->boats);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string',
            'type'            => 'required|string',
            'length'          => 'required|numeric',
            'height'          => 'required|numeric',
            'beam'            => 'required|numeric',
            'speed'           => 'required|numeric',
            'upper_clearance' => 'required|numeric',
            'lower_clearance' => 'required|numeric',
        ]);

        $boat = Boat::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($boat, 201);
    }

    public function show(Request $request, $id)
    {
        $boat = Boat::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$boat) return response()->json(['message' => 'Não encontrado'], 404);

        return response()->json($boat);
    }

    public function update(Request $request, $id)
    {
        $boat = Boat::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$boat) return response()->json(['message' => 'Não encontrado'], 404);

        $boat->update($request->all());
        return response()->json($boat);
    }

    public function destroy(Request $request, $id)
    {
        $boat = Boat::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$boat) return response()->json(['message' => 'Não encontrado'], 404);

        $boat->delete();
        return response()->json(['message' => 'Embarcação removida']);
    }
}
