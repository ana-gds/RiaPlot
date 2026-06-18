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

    // Modelo hidrodinâmico Valida4D da Hidromod — devolve marés/níveis de água
    // dependentes da localização (ao contrário da FCUL, que é ponto único).
    // Os GUIDs identificam os modelos provisionados para este projeto.
    'valida4d' => [
        'base_url'          => env('VALIDA4D_BASE_URL', 'https://service.hidromod.com/valida4dapi'),
        'extreme_event_id'  => env('VALIDA4D_EXTREME_EVENT_ID', 'BEC5D42AF6BA4A2D8A65E5D5CE8F4065'),
        'execution_id'      => env('VALIDA4D_EXECUTION_ID', '2A2F4FE6592648BD9D881A153183C8A8'),
        'timeout'           => (int) env('VALIDA4D_TIMEOUT', 20),
        'poll_attempts'     => (int) env('VALIDA4D_POLL_ATTEMPTS', 90),
        'poll_interval_ms'  => (int) env('VALIDA4D_POLL_INTERVAL_MS', 400),
        // Tempo de cache dos extremos por local (horas). Os extremos não mudam.
        'cache_hours'       => (int) env('VALIDA4D_CACHE_HOURS', 6),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
