<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('bookings')->insert([
            [
                'user_id'      => 1,
                'vehicle'      => 'Honda Beat 2020',
                'booking_date' => Carbon::now()->addDays(1),
                'status'       => 'pending',
                'notes'        => 'Ganti oli dan cek rem',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ],
            [
                'user_id'      => 2,
                'vehicle'      => 'Yamaha NMAX 2022',
                'booking_date' => Carbon::now()->addDays(2),
                'status'       => 'confirmed',
                'notes'        => 'Servis ringan',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ],
            [
                'user_id'      => 1,
                'vehicle'      => 'Honda Vario 125',
                'booking_date' => Carbon::now()->addDays(5),
                'status'       => 'completed',
                'notes'        => 'Ganti kampas rem',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ],
        ]);
    }
}
