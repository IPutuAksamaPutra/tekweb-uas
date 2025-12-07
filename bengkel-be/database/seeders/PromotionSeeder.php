<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;
use App\Models\Product; // Import Model Product
use Carbon\Carbon;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan tabel Product memiliki data, minimal 2 record
        $product1 = Product::first(); 
        $product2 = Product::skip(1)->first(); 
        
        // 🛑 SOLUSI: Kosongkan tabel Promotions sebelum seeding untuk mencegah error UNIQUE
        Promotion::truncate(); 

        // --- 1. Buat Promosi 1: Diskon Persentase (Aktif Saat Ini) ---
        $promotionA = Promotion::create([
            'name' => 'Diskon Awal Bulan',
            'discount_type' => 'percentage',
            'discount_value' => 15.00, // 15%
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => Carbon::now()->addDays(5),
            'is_active' => true,
        ]);

        // --- 2. Buat Promosi 2: Diskon Nilai Tetap (Aktif di Masa Depan) ---
        $promotionB = Promotion::create([
            'name' => 'Gratis Oli Samping',
            'discount_type' => 'fixed',
            'discount_value' => 25000.00, // Diskon 25.000
            'start_date' => Carbon::now()->addDays(10), 
            'end_date' => Carbon::now()->addDays(20),
            'is_active' => true,
        ]);

        // 3. Menghubungkan Promosi ke Produk (Tabel Pivot product_promotion)
        if ($product1 && $product2) {
            // Tautkan Promosi A (Diskon Awal Bulan) ke Product 1 dan Product 2
            $promotionA->products()->attach([$product1->id, $product2->id]);

            // Tautkan Promosi B (Gratis Oli Samping) hanya ke Product 1
            $promotionB->products()->attach($product1->id);
            
            echo "Berhasil membuat 2 promosi dan menautkannya ke produk.\n";
        } else {
            echo "Peringatan: Tidak cukup data Produk untuk menautkan promosi. Pastikan ProductSeeder dijalankan sebelum PromotionSeeder.\n";
        }
    }
}