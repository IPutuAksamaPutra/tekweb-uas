<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Artisan; // ⬅️ TAMBAH INI

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
        if (config('app.env') === 'production') {
            URL::forceScheme('https');

            try {
                // 🔥 INI WAJIB UNTUK FIX CORS DI RAILWAY
                Artisan::call('config:clear');
                Artisan::call('route:clear');
                Artisan::call('cache:clear');

                // (opsional, sudah kamu pakai)
                Artisan::call('migrate', ['--force' => true]);
            } catch (\Throwable $e) {
                // biarkan kosong
            }
        }

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            $queries = parse_url($url, PHP_URL_QUERY);
            $frontendBaseUrl = rtrim(config('app.frontend_url'), '/');

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
