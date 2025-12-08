<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // Relasi ke users
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('jenis_kendaraan'); // Matic / Manual
            $table->string('nama_kendaraan');  // Nama motor/mobil

            // Perbaikan: DIGANTI DARI "services_id" ke "jenis_service"
            $table->string('jenis_service'); // Service Ringan, Ganti Oli, dll
            
            $table->date('booking_date');     // Tanggal booking
            $table->string('no_wa');          // No WhatsApp customer
            $table->text('notes')->nullable();// Catatan tambahan
            $table->string('status')->default('Pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
