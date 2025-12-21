<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered; // ✅ TAMBAH INI

class AuthController extends Controller
{
    /**
     * REGISTER USER
     * Langsung terdaftar dan bisa langsung login.
     */
    public function register(Request $request)
    {
        try {
            // 1. Validasi Input
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6|confirmed'
            ]);

            // 2. Buat User Baru
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer',
            ]);

            // ✅ TRIGGER EMAIL VERIFICATION (INI KUNCI)
            event(new Registered($user));

            return response()->json([
                'message' => 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
                'user' => $user,
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Register error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registrasi gagal',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // === LOGIN, PROFILE, LOGOUT TIDAK DIUBAH ===
}
