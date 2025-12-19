<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    // =========================
    // REGISTER
    // =========================
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'customer'
        ]);

        // Kirim email verifikasi
        event(new Registered($user));

        // Token hanya untuk keperluan internal (opsional)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
            'user'    => $user,
            'token'   => $token
        ], 201);
    }

    // =========================
    // LOGIN (🔥 FIX FINAL)
    // =========================
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        // Hapus token lama
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        // 🔥 SIMPAN TOKEN KE COOKIE (INI KUNCI)
        return response()->json([
            'message' => 'Login berhasil',
            'user'    => $user
        ])->withCookie(
            cookie(
                'token',
                $token,
                60 * 24,        // 1 hari (menit)
                '/',
                '.up.railway.app', // 🔥 penting (domain backend)
                true,            // Secure (HTTPS)
                true,            // HttpOnly
                false,
                'None'           // 🔥 SameSite=None (WAJIB)
            )
        );
    }

    // =========================
    // PROFILE (AUTH REQUIRED)
    // =========================
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // =========================
    // LOGOUT (OPSIONAL TAPI DISARANKAN)
    // =========================
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ])->withCookie(
            cookie(
                'token',
                '',
                -1,
                '/',
                '.up.railway.app'
            )
        );
    }
}
