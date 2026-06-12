<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Poi;
use Illuminate\Support\Str;

class PoiSeeder extends Seeder
{
    public function run(): void
    {
        Poi::truncate();

        $now = now()->toISOString();

        $boias = [
            // --- Boias isoladas ---
            ['name' => 'Boia Bombordo 1',  'type' => 'boia_bombordo',  'coordinates' => [40.792617, -8.671667]],
            ['name' => 'Boia Estibordo 1', 'type' => 'boia_estibordo', 'coordinates' => [40.810467, -8.643550]],

            // --- Canal de Ovar / Carregal ---
            ['name' => 'Boia Bombordo 2',  'type' => 'boia_bombordo',  'coordinates' => [40.858817, -8.657017]],
            ['name' => 'Boia Bombordo 3',  'type' => 'boia_bombordo',  'coordinates' => [40.856283, -8.656883]],
            ['name' => 'Boia Estibordo 2', 'type' => 'boia_estibordo', 'coordinates' => [40.854783, -8.655633]],
            ['name' => 'Boia Estibordo 3', 'type' => 'boia_estibordo', 'coordinates' => [40.851567, -8.655033]],
            ['name' => 'Boia Estibordo 4', 'type' => 'boia_estibordo', 'coordinates' => [40.848333, -8.656650]],
            ['name' => 'Boia Bombordo 4',  'type' => 'boia_bombordo',  'coordinates' => [40.844083, -8.661000]],
            ['name' => 'Boia Bombordo 5',  'type' => 'boia_bombordo',  'coordinates' => [40.839667, -8.662650]],
            ['name' => 'Boia Bombordo 6',  'type' => 'boia_bombordo',  'coordinates' => [40.835650, -8.662217]],
            ['name' => 'Boia Estibordo 5', 'type' => 'boia_estibordo', 'coordinates' => [40.830100, -8.659750]],
            ['name' => 'Boia Estibordo 6', 'type' => 'boia_estibordo', 'coordinates' => [40.826667, -8.660400]],
            ['name' => 'Boia Bombordo 7',  'type' => 'boia_bombordo',  'coordinates' => [40.823017, -8.663817]],
            ['name' => 'Boia Estibordo 7', 'type' => 'boia_estibordo', 'coordinates' => [40.818717, -8.665500]],
            ['name' => 'Boia Bombordo 8',  'type' => 'boia_bombordo',  'coordinates' => [40.813633, -8.668200]],
            ['name' => 'Boia Bombordo 9',  'type' => 'boia_bombordo',  'coordinates' => [40.809200, -8.670483]],
            ['name' => 'Boia Estibordo 8', 'type' => 'boia_estibordo', 'coordinates' => [40.804850, -8.670650]],
            ['name' => 'Boia Bombordo 10', 'type' => 'boia_bombordo',  'coordinates' => [40.800500, -8.672767]],
            ['name' => 'Boia Estibordo 9', 'type' => 'boia_estibordo', 'coordinates' => [40.796017, -8.670633]],
            ['name' => 'Boia Estibordo 10','type' => 'boia_estibordo', 'coordinates' => [40.796650, -8.665083]],
            ['name' => 'Boia Bombordo 11', 'type' => 'boia_bombordo',  'coordinates' => [40.800017, -8.660083]],
        ];

        foreach ($boias as $boia) {
            Poi::create([
                '_id'         => Str::uuid()->toString(),
                'name'        => $boia['name'],
                'coordinates' => $boia['coordinates'], // [lat, lng] — igual ao schema existente
                'type'        => $boia['type'],
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
        }

        $this->command->info('✅ PoiSeeder: 21 boias de navegação importadas (11 bombordo, 10 estibordo).');
    }
}
