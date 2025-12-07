<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    // database/seeders/ProductSeeder.php

// ...
    public function run(): void
    {
        Product::create([
            'name' => 'Busi Iridium NGK',
            'slug' => 'busi-iridium-ngk',
            'description' => 'Busi performa tinggi untuk motor.',
            'price' => 75000,
            'stock' => 150,
            'img_url' => 'products/busi.jpg',
            'jenis_barang' => 'Sparepart', // <-- GANTI KE ENUM
            // ...
        ]);
        
        Product::create([
            'name' => 'Helm Full Face Zeus',
            'slug' => 'helm-full-face-zeus',
            'description' => 'Helm dengan standar SNI.',
            'price' => 850000,
            'stock' => 50,
            'img_url' => 'products/helm.jpg',
            'jenis_barang' => 'Aksesoris', // <-- GANTI KE ENUM
            // ...
        ]);
        // ...
    }
}
