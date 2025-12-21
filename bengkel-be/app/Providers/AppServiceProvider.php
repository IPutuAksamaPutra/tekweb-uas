<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        VerifyEmail::toMailUsing(function ($notifiable, $url) {

            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            $query = parse_url($url, PHP_URL_QUERY);

            $frontendBaseUrl = rtrim(config('app.frontend_url'), '/');
            $frontendUrl = "{$frontendBaseUrl}/auth/verify-email/{$id}/{$hash}?{$query}";

            return (new MailMessage)
                ->from(config('mail.from.address'), config('mail.from.name'))
                ->replyTo(config('mail.from.address'))
                ->subject('Verifikasi Alamat Email - Bengkel Dexar')
                ->greeting('Halo, ' . $notifiable->name . ' 👋')
                ->line('Terima kasih telah mendaftar.')
                ->line('Silakan klik tombol di bawah ini untuk memverifikasi akun Anda.')
                ->action('Verifikasi Email', $frontendUrl)
                ->line('Jika Anda tidak merasa mendaftar, abaikan email ini.');
        });
    }
}
