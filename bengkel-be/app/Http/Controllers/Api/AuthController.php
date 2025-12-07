<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cookie; // 💡 TAMBAHKAN INI

class AuthController extends Controller
{
    /**
     * Menangani permintaan registrasi pengguna baru. Role otomatis 'customer'.
     */
    public function register(Request $request)
    {
        // ... (Kode Register tidak berubah)
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
        ]);

        $token = $user->createToken('register-token', ['customer'])->plainTextToken;

        return response()->json([
            'message' => 'Registrasi customer berhasil!',
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Menangani permintaan login dan menghasilkan Bearer Token Sanctum.
     * Tidak ada perubahan signifikan di sini, fokus utama ada di logout.
     */
    public function login(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Cari User dan Verifikasi Kredensial
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        // 3. Hapus Token Lama dan Generate Token Baru
        // Ini memastikan hanya ada satu token aktif per perangkat/login.
        $user->tokens()->delete(); 
        $token = $user->createToken('AuthToken', [$user->role])->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Mengambil detail pengguna yang sedang login (Membutuhkan Token).
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->only(['id', 'name', 'email', 'role']),
        ]);
    }

    /**
     * Menangani permintaan logout (Mencabut token yang sedang digunakan)
     * dan MENGHAPUS COOKIE SESI yang menyebabkan masalah "nyangkut".
     */
    public function logout(Request $request)
    {
        // 1. Mencabut Token Bearer Sanctum (Ini sudah benar)
        $request->user()->currentAccessToken()->delete();

        // 2. Buat respons JSON default
        $response = response()->json([
            'message' => 'Logout berhasil. Token dicabut dan cookie sesi dihapus.'
        ], 200);

        // 3. 💡 HAPUS COOKIE SESI DARI SISI SERVER 💡
        // INI ADALAH SOLUSI ANTI-NYANGKUT. 
        // Server memiliki otoritas untuk menghapus cookie yang diset oleh dirinya sendiri.
        $response->withCookie(Cookie::forget('laravel_session'));
        $response->withCookie(Cookie::forget('XSRF-TOKEN'));
        
        // Tambahkan cookie lain yang mungkin Anda gunakan untuk menyimpan token:
        // $response->withCookie(Cookie::forget('nama_cookie_token_anda'));

        return $response;
    }
}