<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Ubah tipe kolom 'img_url' menjadi JSON
            // Metode change() diperlukan saat memodifikasi kolom yang sudah ada.
            $table->json('img_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert kembali ke tipe data sebelumnya jika diperlukan
            // Asumsi sebelumnya adalah string/varchar:
            $table->string('img_url', 255)->nullable()->change(); 
        });
    }
};