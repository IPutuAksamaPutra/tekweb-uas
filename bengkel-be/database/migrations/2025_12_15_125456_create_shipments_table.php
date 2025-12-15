<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('shipments', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();

    $table->string('address');
    $table->decimal('shipping_cost', 12, 2)->default(0);

    $table->enum('status', [
        'diterima',
        'diproses',
        'dikirim',
        'selesai'
    ])->default('diterima');

    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('status_updated_at')->nullable();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
