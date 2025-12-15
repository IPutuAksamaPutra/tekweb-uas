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

    // --- 1. READ (List Booking) ---
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

    // --- 2. CREATE (Simpan Booking Baru) ---
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

        $booking->load('user:id,name');

        return response()->json([
            'message' => 'Booking berhasil dibuat. Menunggu konfirmasi.',
            'booking' => $booking
        ], 201);
    }

    // --- 3. READ (Detail Booking) ---
    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $allowedToView = in_array($user->role, $this->managementRoles) || $booking->user_id === $user->id;

        if (!$allowedToView) {
            return response()->json(['message' => 'Anda tidak diizinkan melihat detail booking ini.'], 403);
        }

        return response()->json([
            'message' => 'Detail booking berhasil diambil.',
            'booking' => $booking->load('user:id,name,email')
        ]);
    }

    // --- 4. UPDATE (Perbarui Booking) ---
    public function update(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array($user->role, $this->managementRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk memperbarui booking.'
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

        return response()->json([
            'message' => 'Booking berhasil diperbarui.',
            'booking' => $booking->load('user:id,name,email')
        ]);
    }

    // --- 5. DELETE (Hapus Booking) ---
    public function destroy(Request $request, Booking $booking)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array($user->role, $this->managementRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk menghapus booking.'
            ], 403);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Booking berhasil dihapus.'
        ], 200);
    }
    
    /**
     * --- 6. READ (Pencarian Booking Pending/Confirmed untuk Kasir) ---
     */
    public function pendingForCashier(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, $this->managementRoles)) {
            return response()->json(['message' => 'Anda tidak diizinkan mengakses data kasir.'], 403);
        }

        $query = Booking::whereIn('status', ['Pending', 'Confirmed']);

        if ($request->has('q')) { 
            $search = strtolower($request->input('q'));
            $searchTerm = "%{$search}%";
            
            $query->where(function ($q) use ($searchTerm) {
                
                $q->whereRaw('LOWER(COALESCE(jenis_service, "")) LIKE ?', [$searchTerm])
                  ->orWhereRaw('LOWER(COALESCE(no_wa, "")) LIKE ?', [$searchTerm])
                  ->orWhereRaw('LOWER(COALESCE(nama_kendaraan, "")) LIKE ?', [$searchTerm]);
                
                if (Schema::hasColumn('bookings', 'code')) {
                    $q->orWhereRaw('LOWER(COALESCE(code, "")) LIKE ?', [$searchTerm]);
                }
            })
            // Mencari berdasarkan Nama Pelanggan (dari relasi user)
            ->orWhereHas('user', function ($q) use ($searchTerm) {
                 $q->where('name', 'LIKE', $searchTerm);
            });
        }

        // Memuat relasi 'user' secara efisien
        $bookings = $query
            ->with('user:id,name,email') 
            ->latest()
            ->get()
            // ✅ MAPPING NAMA USER: Inject user_name ke tingkat root objek
            ->map(function ($booking) {
                $bookingData = $booking->toArray();
                
                // 🔥 Mengambil nama dari relasi 'user'
                $bookingData['user_name'] = $booking->user->name ?? 'Pelanggan'; 
                
                // Pastikan remaining_due ada
                $bookingData['remaining_due'] = $booking->remaining_due ?? 0;
                
                return $bookingData;
            });

        return response()->json([
            'message' => 'Daftar booking siap kasir berhasil diambil.',
            'data' => $bookings
        ]);
    }

    // --- 7. Index Admin (Delegasi ke pendingForCashier) ---
    public function indexAdmin(Request $request)
    {
        return $this->pendingForCashier($request);
    }
}