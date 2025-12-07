<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; 

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. NONAKTIFKAN Foreign Key Checks (Wajib saat truncate atau seeding kompleks)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;'); 

        $this->call([
            // --- DATA INDUK DAN INTI ---
            UserSeeder::class,      // ID user dibutuhkan oleh hampir semua tabel
              
            PromotionSeeder::class, // Harus di sini sebelum ProductSeeder jika ProductSeeder me-refer-nya
            ProductSeeder::class,   
            
            // --- BOOKING & LAYANAN ---
            // Booking adalah induk dari Cashier
            BookingSeeder::class,   
            
            // --- TRANSAKSI & DETAIL ---
            CartItemSeeder::class,
            OrderSeeder::class,
            ShippingProgresSeeder::class,
            ReviewSeeder::class,
            CashierSeeder::class, // Paling bawah karena merujuk ke Booking dan Product
            
            // Note: Hapus ServiceSeeder jika tabel 'services' tidak lagi digunakan
        ]);

        // 2. AKTIFKAN Kembali Foreign Key Checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;'); 
    }
}