<?php
return [

    'paths' => [
        'api/*',
        'email/verify/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://bengkeldexar.vercel.app',
        'http://localhost:3000',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
