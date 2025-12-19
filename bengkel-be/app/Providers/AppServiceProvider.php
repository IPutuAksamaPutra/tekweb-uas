<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
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

            // Ambil URL frontend dari ENV (AMAN untuk local & production)
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
