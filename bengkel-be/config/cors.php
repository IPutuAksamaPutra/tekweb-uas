<?php

return [

    'paths' => [
        'api/*', // ⬅️ INI SAJA SUDAH CUKUP
    ],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'https://bengkeldexar.vercel.app',
        'http://localhost:3000',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
