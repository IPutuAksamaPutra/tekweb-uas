<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Mail;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        VerifyEmail::toMailUsing(function ($notifiable, $url) {
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            $query = parse_url($url, PHP_URL_QUERY);

            $frontendBaseUrl = rtrim(config('app.frontend_url'), '/');
            $frontendUrl = "{$frontendBaseUrl}/auth/verify-email/{$id}/{$hash}?{$query}";

            // HTML email langsung
            $html = "
                <h1>Halo, {$notifiable->name} 👋</h1>
                <p>Terima kasih telah mendaftar.</p>
                <p>Silakan klik tombol di bawah ini untuk verifikasi akun Anda:</p>
                <a href='{$frontendUrl}' style='padding:10px 20px; background:#4CAF50; color:white; text-decoration:none;'>Verifikasi Email</a>
                <p>Jika Anda tidak mendaftar, abaikan email ini.</p>
            ";

            // Kirim email via Resend
            Mail::mailer('resend')->to($notifiable->email)->send(new class($html) extends \Illuminate\Mail\Mailable {
                public $htmlContent;
                public function __construct($html)
                {
                    $this->htmlContent = $html;
                }

                public function build()
                {
                    return $this->subject('Verifikasi Email - Bengkel Dexar')
                                ->html($this->htmlContent);
                }
            });
        });
    }
}
