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
     * REGISTER USER (CUSTOMER)
     */
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6|confirmed'
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer', // Default role untuk registrasi publik
            ]);

            // Kirim email verifikasi tanpa memblokir request utama
            try {
                event(new Registered($user));
            } catch (\Throwable $e) {
                Log::error('Gagal kirim email verifikasi: ' . $e->getMessage());
            }

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
     * LOGIN USER (WITH ROLE BYPASS FOR VERIFICATION)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // 1. Cek keberadaan user dan kecocokan password
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        /**
         * 2. LOGIKA BYPASS VERIFIKASI
         * Role admin, super_admin, dan kasir diizinkan masuk tanpa verifikasi email.
         * Customer wajib memiliki email_verified_at yang tidak null.
         */
        $privilegedRoles = ['super_admin', 'admin', 'kasir'];
        
        if (!in_array($user->role, $privilegedRoles)) {
            if (!$user->hasVerifiedEmail()) {
                return response()->json([
                    'message' => 'Akun customer ini belum diverifikasi. Silakan cek email Anda.'
                ], 403);
            }
        }

        // 3. Kelola Token Sanctum
        $user->tokens()->delete(); // Hapus sesi lama
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Penting untuk routing di frontend
            ],
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    /**
     * PROFILE
     */
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}