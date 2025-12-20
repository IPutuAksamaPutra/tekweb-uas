<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Validator;
use App\Models\User; 
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BookingController extends Controller
{
    private $managementRoles = ['admin', 'super_admin', 'kasir'];
    private $allowedServices = ['Service Ringan', 'Service Berat', 'Ganti Oli', 'Perbaikan Rem', 'Tune Up'];

    // ================================================================
    // 📊 1. MANAGE (Khusus Admin Panel - Munculkan Semua dengan Relasi)
    // ================================================================
    public function manage(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, $this->managementRoles)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ambil semua booking dengan data User (id dan name)
        $bookings = Booking::with('user:id,name')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data antrean berhasil diambil.',
            'bookings' => $bookings
        ], 200);
    }

    // --- 2. index (List Booking untuk Customer/Admin) ---
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $query = Booking::query();

        if (in_array($user->role, $this->managementRoles)) {
            $bookings = $query->with('user:id,name')->latest()->get(); 
        } 
        else {
            $bookings = $query->where('user_id', $user->id)->with('user:id,name')->latest()->get(); 
        }

        return response()->json([
            'message' => 'Daftar booking berhasil diambil.',
            'bookings' => $bookings
        ]);
    }

    // --- 3. CREATE (Simpan Booking Baru) ---
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Hanya pengguna customer yang dapat membuat booking.'], 403);
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

        $booking->load('user:id,name');

        return response()->json([
            'message' => 'Booking berhasil dibuat. Menunggu konfirmasi.',
            'booking' => $booking
        ], 201);
    }

    // --- 4. SHOW (Detail Booking) ---
    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $allowedToView = in_array($user->role, $this->managementRoles) || $booking->user_id === $user->id;

        if (!$allowedToView) {
            return response()->json(['message' => 'Anda tidak diizinkan melihat detail ini.'], 403);
        }

        return response()->json([
            'message' => 'Detail booking berhasil diambil.',
            'booking' => $booking->load('user:id,name,email')
        ]);
    }

    // --- 5. UPDATE (Perbarui Status/Data) ---
    public function update(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array($user->role, $this->managementRoles)) {
            return response()->json(['message' => 'Anda tidak memiliki izin.'], 403);
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

        return response()->json([
            'message' => 'Booking berhasil diperbarui.',
            'booking' => $booking->load('user:id,name,email')
        ]);
    }

    // --- 6. DELETE (Hapus Booking) ---
    public function destroy(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, $this->managementRoles)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->delete();

        return response()->json(['message' => 'Booking berhasil dihapus.'], 200);
    }
    
    // ================================================================
    // 🕵️‍♂️ 7. SEARCH UNTUK KASIR (Pencarian Berdasarkan Nama)
    // ================================================================
    public function pendingForCashier(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, $this->managementRoles)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = Booking::whereIn('status', ['Pending', 'Confirmed']);

        if ($request->has('q')) { 
            $search = strtolower($request->input('q'));
            $searchTerm = "%{$search}%";
            
            $query->where(function ($q) use ($searchTerm) {
                // Cari Nama Pelanggan di tabel Users
                $q->whereHas('user', function ($uq) use ($searchTerm) {
                    $uq->where('name', 'LIKE', $searchTerm);
                })
                ->orWhere('jenis_service', 'LIKE', $searchTerm)
                ->orWhere('no_wa', 'LIKE', $searchTerm)
                ->orWhere('nama_kendaraan', 'LIKE', $searchTerm);
            });
        }

        $bookings = $query->with('user:id,name')->latest()->limit(10)->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_name' => $booking->user->name ?? 'Pelanggan Umum',
                    'jenis_service' => $booking->jenis_service,
                    'nama_kendaraan' => $booking->nama_kendaraan,
                    'remaining_due' => $booking->remaining_due ?? 0,
                    'status' => $booking->status,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    // --- 8. Index Admin (Delegasi) ---
    public function indexAdmin(Request $request)
    {
        return $this->manage($request);
    }

    // --- 9. My Bookings (Riwayat Customer) ---
    public function myBookings(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        return response()->json([
            'message' => 'Riwayat booking diambil.',
            'bookings' => Booking::where('user_id', $user->id)->latest()->get()
        ]);
    }
}