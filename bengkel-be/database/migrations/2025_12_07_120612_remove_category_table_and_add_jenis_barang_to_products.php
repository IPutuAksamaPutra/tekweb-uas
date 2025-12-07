<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi (UP): Hapus kategori, tambahkan ENUM.
     */
    public function up(): void
    {
        // 1. Modifikasi tabel 'products'
        Schema::table('products', function (Blueprint $table) {
            
            // Periksa dan hapus foreign key constraint terlebih dahulu
            // Nama constraint default biasanya 'products_category_id_foreign'
            $table->dropForeign(['category_id']);
            
            // Hapus kolom category_id yang lama
            $table->dropColumn('category_id');

            // 2. Tambahkan kolom baru 'jenis_barang' dengan tipe ENUM
            $table->enum('jenis_barang', ['Sparepart', 'Aksesoris'])->after('description');
        });

        // 3. Hapus tabel 'categories' karena tidak lagi digunakan
        Schema::dropIfExists('categories');
    }

    /**
     * Balikkan migrasi (DOWN): Kembalikan struktur awal.
     */
    public function down(): void
    {
        // 1. Buat ulang tabel 'categories'
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // 2. Modifikasi tabel 'products'
        Schema::table('products', function (Blueprint $table) {
            
            // Hapus kolom jenis_barang yang baru
            $table->dropColumn('jenis_barang');

            // Tambahkan kembali kolom category_id yang lama
            $table->unsignedBigInteger('category_id')->nullable();

            // Tambahkan kembali foreign key constraint
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }
};