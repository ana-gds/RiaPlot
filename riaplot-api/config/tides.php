<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pontos de referência de maré (Ria de Aveiro)
    |--------------------------------------------------------------------------
    |
    | Para os quais se pré-calcula a maré com o modelo Valida4D (comando
    | `tides:refresh-points`, agendado em routes/console.php). O endpoint
    | /api/tides/local devolve o ponto mais próximo do centro do mapa, de forma
    | instantânea — em vez de chamar o Valida4D ao vivo (que pode demorar ~15s).
    |
    | As coordenadas estão nos canais/braços navegáveis da laguna. Pontos que o
    | modelo não cubra são simplesmente ignorados pelo comando de refresh.
    |
    */
    'reference_points' => [
        ['key' => 'barra',         'name' => 'Barra',                  'lat' => 40.6433, 'lng' => -8.7440],
        ['key' => 'sao-jacinto',   'name' => 'São Jacinto',            'lat' => 40.6640, 'lng' => -8.7270],
        ['key' => 'gafanha',       'name' => 'Gafanha da Nazaré',      'lat' => 40.6330, 'lng' => -8.7170],
        ['key' => 'costa-nova',    'name' => 'Costa Nova',             'lat' => 40.6120, 'lng' => -8.7510],
        ['key' => 'vagueira',      'name' => 'Vagueira',               'lat' => 40.5640, 'lng' => -8.7530],
        ['key' => 'aveiro',        'name' => 'Aveiro',                 'lat' => 40.6460, 'lng' => -8.7080],
        ['key' => 'aveiro-cidade', 'name' => 'Aveiro (cidade)',        'lat' => 40.6405, 'lng' => -8.6560],
        ['key' => 'torreira',      'name' => 'Torreira',               'lat' => 40.7470, 'lng' => -8.6970],
        ['key' => 'murtosa',       'name' => 'Murtosa',                'lat' => 40.7430, 'lng' => -8.6620],
        ['key' => 'bestida',       'name' => 'Bestida',                'lat' => 40.7180, 'lng' => -8.6470],
        ['key' => 'estarreja',     'name' => 'Canal de Estarreja',     'lat' => 40.7560, 'lng' => -8.6080],
    ],

    // Idade máxima (horas) dos pontos pré-calculados antes de o painel preferir
    // o cálculo ao vivo — rede de segurança caso o agendamento diário falhe.
    'point_max_age_hours' => (int) env('TIDES_POINT_MAX_AGE_HOURS', 36),

    // Fuso para apresentar as horas das marés (hora legal portuguesa).
    'timezone' => env('TIDES_TIMEZONE', 'Europe/Lisbon'),

];
