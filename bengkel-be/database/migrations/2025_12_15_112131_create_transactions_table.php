<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_user_id')->nullable()->constrained('users'); // Kasir yang memproses
            $table->enum('payment_method', ['Cash', 'Card', 'Transfer']);
            $table->decimal('total_amount', 10, 2); // Total Tagihan
            $table->decimal('paid_amount', 10, 2);  // Uang yang diterima (penting untuk kembalian)
            $table->decimal('change_amount', 10, 2)->default(0); // Kembalian
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};