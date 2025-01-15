<?php

return [
    'default' => env('BROADCAST_DRIVER', 'pusher'),

    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY', 'e40e2d17d7e700e559c1'),
            'secret' => env('PUSHER_APP_SECRET', 'f69959e040e2c6605ab5'),
            'app_id' => env('PUSHER_APP_ID', '1922300'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'eu'),
                'useTLS' => true,
                'encrypted' => true,
                'host' => env('PUSHER_HOST') ?: 'api-' . env('PUSHER_APP_CLUSTER', 'eu') . '.pusher.com',
                'port' => env('PUSHER_PORT', 443),
                'scheme' => env('PUSHER_SCHEME', 'https'),
            ],
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],
];
