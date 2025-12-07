<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CartItem;
use App\Models\User; // Digunakan untuk mendapatkan ID user
use App\Models\Product; // Digunakan untuk mendapatkan ID produk

class CartItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada User dan Product yang sudah ada (dari seeder lain)
        $user1 = User::first();
        $product1 = Product::first();
        $product2 = Product::skip(1)->first(); // Ambil produk kedua

        // Hanya jalankan jika user dan product ditemukan
        if ($user1 && $product1 && $product2) {
            // Item 1: Dimiliki oleh User pertama
            CartItem::create([
                'user_id' => $user1->id, 
                'product_id' => $product1->id,
                'quantity' => 2,
            ]);

            // Item 2: User yang sama membeli produk yang berbeda
            CartItem::create([
                'user_id' => $user1->id,
                'product_id' => $product2->id,
                'quantity' => 1,
            ]);

            // Opsional: Jika Anda memiliki user kedua
            // $user2 = User::skip(1)->first();
            // if ($user2) {
            //     CartItem::create([
            //         'user_id' => $user2->id,
            //         'product_id' => $product1->id,
            //         'quantity' => 3,
            //     ]);
            // }

        } else {
            // Jika Anda mendapati pesan ini, pastikan UserSeeder dan ProductSeeder sudah berjalan
            echo "Peringatan: Tidak dapat membuat CartItem karena User atau Product belum ada.\n";
        }
    }
}