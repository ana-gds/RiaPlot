<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class HidromodController extends Controller
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        // Garante que a URL não termina com barra e configura um timeout seguro
        $this->baseUrl = rtrim(config('services.hidromod.base_url'), '/');
        $this->timeout = 15;
    }

    /**
     * 1. Listar todas as rotas pré-configuradas na Hidromod
     * Corresponde ao GET /Route/All do Swagger
     */
    public function index()
    {
        $cacheKey = 'hidromod_routes_all';

        $routes = Cache::remember($cacheKey, now()->addDay(), function () {
            $response = Http::timeout($this->timeout)
                ->get("{$this->baseUrl}/Route/All");

            if ($response->failed()) {
                return null;
            }

            return $response->json();
        });

        if (is_null($routes)) {
            return response()->json(['error' => 'Não foi possível obter as rotas do servidor externo'], 502);
        }

        return response()->json($routes);
    }

    /**
     * 2. Obter a geometria/pontos GPS de uma rota específica
     * Corresponde ao GET /Route/{id}/{reverse} do Swagger
     */
    public function show(string $id, Request $request)
    {
        $reverse = $request->query('reverse', 0);
        $cacheKey = "hidromod_route_{$id}_{$reverse}";

        $routeGeometry = Cache::remember($cacheKey, now()->addDay(), function () use ($id, $reverse) {
            $response = Http::timeout($this->timeout)
                ->get("{$this->baseUrl}/Route/{$id}/{$reverse}");

            if ($response->failed()) {
                return null;
            }

            return $response->json();
        });

        if (is_null($routeGeometry)) {
            return response()->json(['error' => 'Não foi possível obter a geometria da rota'], 502);
        }

        return response()->json($routeGeometry);
    }

    /**
     * 3. Obter os dados meteorológicos e níveis de água da rota
     * Corresponde ao GET /Route/Download/{id} do Swagger
     */
    public function dados(string $id)
    {
        $cacheKey = "hidromod_data_{$id}";

        $metaData = Cache::remember($cacheKey, now()->addHour(), function () use ($id) {
            $response = Http::timeout($this->timeout)
                ->get("{$this->baseUrl}/Route/Download/{$id}");

            if ($response->failed()) {
                return null;
            }

            return $response->json();
        });

        if (is_null($metaData)) {
            return response()->json(['error' => 'Não foi possível obter os dados meteorológicos da rota'], 502);
        }

        return response()->json($metaData);
    }

    /**
     * 4. Disparar leitura de ficheiros GPX na pasta local do servidor Valida4D
     * Corresponde ao GET /Route/ProcessGpxFiles do Swagger
     * Nota: processa ficheiros na infraestrutura da Hidromod, não no nosso servidor
     */
    public function processGpxFiles()
    {
        $response = Http::timeout($this->timeout)
            ->get("{$this->baseUrl}/Route/ProcessGpxFiles");

        if ($response->failed()) {
            return response()->json(['error' => 'Não foi possível processar os ficheiros GPX'], 502);
        }

        Cache::forget('hidromod_routes_all');

        return response()->json($response->json());
    }
}
