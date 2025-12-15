<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade'); // Hubungan ke tabel utama
            
            // Item details
            $table->foreignId('product_id')->nullable()->constrained('products');
            $table->foreignId('booking_id')->nullable()->constrained('bookings');
            $table->enum('item_type', ['product', 'service_manual', 'booking_pelunasan']);
            $table->string('item_name'); // Nama item, berguna untuk service manual
            $table->decimal('price', 10, 2); // Harga satuan
            $table->unsignedSmallInteger('quantity');
            $table->decimal('subtotal', 10, 2); // Harga * Kuantitas
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};