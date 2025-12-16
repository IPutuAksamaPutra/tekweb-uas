<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // DI FILE MIGRASI ANDA
    public function up()
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('order_id')
                ->nullable() // TAMBAHKAN INI!
                ->after('user_id')
                ->constrained('orders')
                ->cascadeOnDelete();
        });
    }

public function down()
{
    Schema::table('reviews', function (Blueprint $table) {
        $table->dropForeign(['order_id']);
        $table->dropColumn('order_id');
    });
}
};
