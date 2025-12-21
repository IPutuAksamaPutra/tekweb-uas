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
        /**
         * 🔐 Paksa HTTPS di production (Railway)
         * WAJIB supaya:
         * - Link verifikasi email tidak http
         * - Tidak kena mixed-content
         */
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        /**
         * 📧 CUSTOM EMAIL VERIFICATION
         * Link diarahkan ke FRONTEND (Next.js)
         */
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {

            // ID & hash user
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());

            // Ambil query expires & signature
            $query = parse_url($url, PHP_URL_QUERY);

            // FRONTEND URL (dari .env)
            $frontendBaseUrl = rtrim(config('app.frontend_url'), '/');

            // Final URL ke Next.js
            $frontendUrl = "{$frontendBaseUrl}/auth/verify-email/{$id}/{$hash}?{$query}";

            return (new MailMessage)
                ->subject('Verifikasi Alamat Email - Bengkel Dexar')
                ->greeting('Halo, ' . $notifiable->name . ' 👋')
                ->line('Terima kasih telah mendaftar.')
                ->line('Silakan klik tombol di bawah ini untuk memverifikasi akun Anda.')
                ->action('Verifikasi Email', $frontendUrl)
                ->line('Jika Anda tidak merasa mendaftar, abaikan email ini.');
        });
    }
}
