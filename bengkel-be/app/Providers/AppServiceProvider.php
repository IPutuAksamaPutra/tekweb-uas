<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// Tambahkan dua import di bawah ini
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            // Ambil ID dan Hash unik user
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            
            // Ambil query string asli (expires & signature)
            $queries = parse_url($url, PHP_URL_QUERY);
            
            // Gabungkan semuanya ke URL Next.js
            // Pastikan path /auth/verify-email sesuai dengan struktur folder di Next.js kamu
            $frontendUrl = "http://localhost:3000/auth/verify-email/{$id}/{$hash}?" . $queries;

            return (new MailMessage)
                ->subject('Verifikasi Alamat Email - Bengkel Dexar')
                ->greeting('Halo, ' . $notifiable->name . '!')
                ->line('Terima kasih telah bergabung. Klik tombol di bawah ini untuk memverifikasi akun Anda.')
                ->action('Verifikasi Email', $frontendUrl)
                ->line('Jika Anda tidak merasa mendaftar, abaikan email ini.');
        });
    }
}