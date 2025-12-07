<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Diperlukan untuk mengisi data lama

return new class extends Migration
{
    public function up(): void
    {
        // PENTING: Jika kolom sudah ada (dari percobaan sebelumnya),
        // hapus if (!Schema::hasColumn) dan ubah ke Schema::table biasa.
        Schema::table('cart_items', function (Blueprint $table) {
            
            // LANGKAH 1: Tambahkan kolom user_id sebagai nullable (Sangat penting agar data lama tidak error)
            // Menggunakan unsignedBigInteger karena foreignId() mungkin sudah menimbulkan masalah sebelumnya
            if (!Schema::hasColumn('cart_items', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
        });

        // LANGKAH 2: Berikan nilai default ke data lama yang NULL
        // Pastikan user dengan ID 1 ada di tabel users.
        if (DB::table('users')->exists()) {
            DB::table('cart_items')->whereNull('user_id')->update(['user_id' => 1]); 
        }

        Schema::table('cart_items', function (Blueprint $table) {
            // LANGKAH 3: Ubah kolom menjadi non-nullable (Wajib Diisi)
            // Catatan: Menggunakan change() membutuhkan 'doctrine/dbal', tapi jika sudah terinstall, ini cara yang benar.
            $table->unsignedBigInteger('user_id')->nullable(false)->change(); 
            
            // LANGKAH 4: Tambahkan Foreign Key Constraint
            $table->foreign('user_id')
                  ->references('id')->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            // Hapus foreign key constraint
            $table->dropForeign(['cart_items_user_id_foreign']); // Gunakan nama constraint default

            // Hapus kolom user_id
            $table->dropColumn('user_id');
        });
    }
};