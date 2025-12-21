<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * REGISTER USER
     */
    public function register(Request $request)
    {
        try {
            // 1. VALIDASI
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6|confirmed'
            ]);

            // 2. SIMPAN USER
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer',
            ]);

            // 3. KIRIM EMAIL VERIFIKASI (JANGAN BLOCK REQUEST)
            try {
                event(new Registered($user));
            } catch (\Throwable $e) {
                Log::error('Gagal kirim email verifikasi: ' . $e->getMessage());
                // ❗ sengaja DIABAIKAN agar API tidak 500
            }

            // 4. RESPONSE
            return response()->json([
                'message' => 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
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

    /**
     * LOGIN USER
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        // OPTIONAL: BLOK LOGIN JIKA EMAIL BELUM VERIFIKASI
        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email belum diverifikasi'
            ], 403);
        }

        // HAPUS TOKEN LAMA
        $user->tokens()->delete();

        // BUAT TOKEN BARU
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * PROFILE USER LOGIN
     */
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}
