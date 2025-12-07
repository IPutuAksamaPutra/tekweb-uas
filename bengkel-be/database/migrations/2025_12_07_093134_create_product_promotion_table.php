<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_promotion', function (Blueprint $table) {
            // Kolom Foreign Key ke tabel products
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // Kolom Foreign Key ke tabel promotions
            $table->foreignId('promotion_id')->constrained('promotions')->onDelete('cascade');
            
            // Mengatur Primary Key gabungan (komposit)
            $table->primary(['product_id', 'promotion_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_promotion');
    }
};