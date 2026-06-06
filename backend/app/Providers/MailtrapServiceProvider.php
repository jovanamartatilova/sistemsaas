<?php
namespace App\Providers;

use App\Mail\Transport\MailtrapApiTransport;
use Illuminate\Support\ServiceProvider;

class MailtrapServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->app['mail.manager']->extend('mailtrap', function () {
            $apiToken = config('mail.mailers.mailtrap.api_token')
                     ?? config('services.mailtrap.api_token')
                     ?? env('MAILTRAP_API_TOKEN');

            if (!$apiToken) {
                throw new \Exception('Mailtrap API token not configured');
            }

            return new MailtrapApiTransport($apiToken);
        });
    }
}
