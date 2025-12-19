<?php

return [

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    // Izinkan Next.js kamu
    'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://tekweb-uas.vercel.app',
],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => false,

    'max_age' => 0,

    'supports_credentials' => true,
];
