<?php

namespace App\Http\Controllers;

use App\Models\Poi;

class PoiController extends Controller
{
    public function index()
    {
        return response()->json(Poi::all());
    }
}
