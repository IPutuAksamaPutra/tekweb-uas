<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

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
        // 🔐 Paksa HTTPS di production (fix mixed content)
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            // Ambil ID dan hash user
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());

            // Ambil query asli (expires & signature)
            $queries = parse_url($url, PHP_URL_QUERY);

            // Ambil frontend URL dari ENV (local / production aman)
            $frontendBaseUrl = rtrim(config('app.frontend_url'), '/');

            // Gabungkan ke URL Next.js
            $frontendUrl = "{$frontendBaseUrl}/auth/verify-email/{$id}/{$hash}?{$queries}";

            return (new MailMessage)
                ->subject('Verifikasi Alamat Email - Bengkel Dexar')
                ->greeting('Halo, ' . $notifiable->name . '!')
                ->line('Terima kasih telah bergabung. Klik tombol di bawah ini untuk memverifikasi akun Anda.')
                ->action('Verifikasi Email', $frontendUrl)
                ->line('Jika Anda tidak merasa mendaftar, abaikan email ini.');
        });
    }
}
