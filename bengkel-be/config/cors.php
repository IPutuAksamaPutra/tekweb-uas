<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'], // Tambahkan api/* agar lebih spesifik

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://tekweb-uas.vercel.app', // Domain Vercel kamu
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [], // Ubah 'false' menjadi array kosong [] agar tidak error

    'max_age' => 0,

    'supports_credentials' => true,
];