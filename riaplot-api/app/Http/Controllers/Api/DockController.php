<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class DockController extends Controller
{
    public function index()
    {
        return response()->json([
            ['id'=>1, 'nome'=>'Terminal de Aveiro', 'latitude'=>40.6404, 'longitude'=>-8.6538, 'tipo'=>'principal'],
            ['id'=>2, 'nome'=>'Cais da Murtosa',    'latitude'=>40.7341, 'longitude'=>-8.6253, 'tipo'=>'principal'],
            ['id'=>3, 'nome'=>'Cais de Torreira',   'latitude'=>40.7637, 'longitude'=>-8.6897, 'tipo'=>'secundario'],
            ['id'=>4, 'nome'=>'São Jacinto',         'latitude'=>40.6617, 'longitude'=>-8.7342, 'tipo'=>'turistico'],
            ['id'=>5, 'nome'=>'Costa Nova',          'latitude'=>40.6131, 'longitude'=>-8.7465, 'tipo'=>'turistico'],
            ['id'=>6, 'nome'=>'Cais de Ílhavo',      'latitude'=>40.5989, 'longitude'=>-8.6847, 'tipo'=>'secundario'],
        ]);
    }
}
