<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class BookingController extends Controller
{
    // Daftar peran manajemen yang boleh UPDATE dan DELETE
    private $managementRoles = ['admin', 'super_admin'];
    
    // Daftar layanan yang diizinkan untuk validasi input
    private $allowedServices = ['Service Ringan', 'Service Berat', 'Ganti Oli', 'Perbaikan Rem', 'Tune Up'];

    // --- 1. READ (List Booking) ---
    /**
     * Mengambil daftar booking. Customer hanya melihat milik sendiri. Staf melihat semua.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Kunci: Eager load relasi 'user' untuk mendapatkan 'user_name' via Accessor
        // Wajib menyertakan 'id' dan 'name' di with()
        $query = Booking::query();

        if (in_array($user->role, ['admin', 'super_admin', 'kasir'])) {
            // Staf/Admin melihat semua
            $bookings = $query->with('user:id,name')->latest()->get(); 
        } else {
            // Customer hanya melihat milik sendiri
            $bookings = $query->where('user_id', $user->id)->with('user:id,name')->latest()->get(); 
        }

        return response()->json([
            'message' => 'Daftar booking berhasil diambil.',
            // Properti 'user_name' akan ditambahkan ke setiap objek booking
            'bookings' => $bookings
        ]);
    }

    // --- 2. CREATE (Simpan Booking Baru) ---
    /**
     * Menyimpan booking baru. Hanya diizinkan untuk Customer.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'customer') {
            return response()->json([
                'message' => 'Hanya pengguna customer yang dapat membuat booking.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'jenis_kendaraan' => 'required|string|in:Matic,Manual',
            'nama_kendaraan' => 'required|string|max:100',
            'jenis_service' => 'required|string|in:' . implode(',', $this->allowedServices), 
            'booking_date' => 'required|date|after_or_equal:today',
            'no_wa' => 'required|string|max:15', 
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking = Booking::create([
            'user_id' => $user->id,
            'jenis_kendaraan' => $request->jenis_kendaraan,
            'nama_kendaraan' => $request->nama_kendaraan,
            'jenis_service' => $request->jenis_service,
            'booking_date' => $request->booking_date,
            'no_wa' => $request->no_wa,
            'notes' => $request->notes,
            'status' => 'Pending',
        ]);

        // Muat relasi user setelah disimpan untuk response (termasuk user_name)
        $booking->load('user:id,name');

        return response()->json([
            'message' => 'Booking berhasil dibuat. Menunggu konfirmasi.',
            'booking' => $booking
        ], 201);
    }

    // --- 3. READ (Detail Booking) ---
    /**
     * Menampilkan detail booking. Hanya boleh diakses oleh pemilik atau staf.
     */
    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $allowedToView = in_array($user->role, ['admin', 'super_admin', 'kasir']) || $booking->user_id === $user->id;

        if (!$allowedToView) {
            return response()->json(['message' => 'Anda tidak diizinkan melihat detail booking ini.'], 403);
        }

        // Muat relasi user untuk Accessor 'user_name'
        return response()->json([
            'message' => 'Detail booking berhasil diambil.',
            'booking' => $booking->load('user:id,name,email')
        ]);
    }

    // --- 4. UPDATE (Perbarui Booking) ---
    /**
     * Memperbarui booking. Hanya diizinkan untuk Admin dan Super Admin.
     */
    public function update(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array($user->role, $this->managementRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin (Hanya Admin atau Super Admin) untuk memperbarui booking.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|string|in:Pending,Confirmed,Canceled,Completed',
            'booking_date' => 'nullable|date|after_or_equal:today',
            'jenis_kendaraan' => 'nullable|string|in:Matic,Manual',
            'nama_kendaraan' => 'nullable|string|max:100',
            'jenis_service' => 'nullable|string|in:' . implode(',', $this->allowedServices),
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking->update($request->all());

        // Muat relasi user setelah diperbarui untuk response (termasuk user_name)
        return response()->json([
            'message' => 'Booking berhasil diperbarui.',
            'booking' => $booking->load('user:id,name,email')
        ]);
    }

    // --- 5. DELETE (Hapus Booking) ---
    /**
     * Menghapus booking. Hanya diizinkan untuk Admin dan Super Admin.
     */
    public function destroy(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array($user->role, $this->managementRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin (Hanya Admin atau Super Admin) untuk menghapus booking.'
            ], 403);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Booking berhasil dihapus.'
        ], 200);
    }
}