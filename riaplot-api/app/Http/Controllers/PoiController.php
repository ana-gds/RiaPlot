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
        $result = [];

        foreach (Poi::all() as $p) {
            $result[] = [
                'id'          => $this->safeId($p->_id),
                'name'        => (string) $p->name,
                'coordinates' => $this->safeCoords($p->coordinates),
                'type'        => (string) $p->type,
            ];
        }

        return response()->json($result);
    }

    /**
     * Converte _id para string UTF-8 segura.
     * Usa duck typing em vez de instanceof para não depender da versão do driver.
     */
    private function safeId(mixed $id): string
    {
        // Objeto BSON Binary com getData() — inserido via shell com UUID()
        if (is_object($id) && method_exists($id, 'getData')) {
            $hex = bin2hex($id->getData());
            return $this->hexToUuid($hex);
        }

        // String válida em UTF-8 — UUID do seeder
        if (is_string($id) && mb_check_encoding($id, 'UTF-8')) {
            return $id;
        }

        // String binária (driver retornou os bytes do BSON Binary como string)
        if (is_string($id)) {
            return $this->hexToUuid(bin2hex($id));
        }

        // Último recurso: garante que nunca retorna vazio
        return uniqid('poi_', true);
    }

    private function hexToUuid(string $hex): string
    {
        if (strlen($hex) === 32) {
            return sprintf('%s-%s-%s-%s-%s',
                substr($hex, 0, 8), substr($hex, 8, 4),
                substr($hex, 12, 4), substr($hex, 16, 4),
                substr($hex, 20, 12));
        }
        return $hex ?: uniqid('poi_', true);
    }

    /** Garante que coordinates é sempre um array de floats, mesmo com BSONArray. */
    private function safeCoords(mixed $coords): array
    {
        if (is_null($coords)) return [];
        $arr = is_array($coords) ? $coords : iterator_to_array($coords);
        return array_map('floatval', array_values($arr));
    }
}
