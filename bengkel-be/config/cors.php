<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // Menentukan path mana saja yang diizinkan untuk CORS (biasanya semua API)
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Mengizinkan semua metode HTTP (GET, POST, PUT, DELETE, OPTIONS, dll)
    'allowed_methods' => ['*'],

    // 🔥 BAGIAN PALING PENTING: Daftar Domain yang Diizinkan Mengakses API
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://tekweb-uas.vercel.app',
        'https://bengkeldexar.vercel.app', // 👈 Domain Vercel barumu
    ],

    // Pola regex untuk domain (kosongkan saja jika sudah pakai allowed_origins)
    'allowed_origins_patterns' => [],

    // Mengizinkan semua jenis header (Authorization, Content-Type, dll)
    'allowed_headers' => ['*'],

    // Header yang boleh dibaca oleh browser (kosongkan jika tidak spesifik)
    'exposed_headers' => [],

    // Berapa lama hasil preflight request (OPTIONS) disimpan di cache browser (detik)
    'max_age' => 0,

    // Set TRUE jika kamu menggunakan Cookies atau Authorization Header (Wajib untuk Sanctum/Passport)
    'supports_credentials' => true,

];