<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'sismar' => [
        'base_url'   => env('SISMAR_BASE_URL',   'https://sismarservices.hidromod.com/reader'),
        'initial_id' => env('SISMAR_INITIAL_ID', 0),   // ← preencher depois do Swagger
        'timeout'    => env('SISMAR_TIMEOUT',    30),
    ],

    'hidromod' => [
        'base_url' => env('HIDROMOD_BASE_URL', 'https://sismarservices.hidromod.com/reader'),
    ],

    // Previsão de marés da FCUL (Prof. Carlos Antunes), ajustada ao marégrafo de
    // Aveiro com dados do Instituto Hidrográfico. Ficheiros anuais em texto.
    // {port} e {year} são substituídos pelo comando de importação tides:import.
    'tides' => [
        'fcul_url_template' => env(
            'TIDES_FCUL_URL_TEMPLATE',
            'https://webpages.ciencias.ulisboa.pt/~cmantunes/hidrografia/{port}FCUL{year}.TXT'
        ),
        // Fuso dos ficheiros FCUL: TU (UTC). A hora legal é calculada na leitura.
        'timezone'    => env('TIDES_TIMEZONE', 'Europe/Lisbon'),
        // Folga de segurança (m) por baixo do calado para considerar navegável.
        'safety_margin' => (float) env('TIDES_SAFETY_MARGIN', 0.3),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
