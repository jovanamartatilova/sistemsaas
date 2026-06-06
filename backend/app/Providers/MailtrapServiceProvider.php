<?php

namespace App\Providers;

use App\Mail\Transport\MailtrapApiTransport;
use Illuminate\Mail\MailManager;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Transport;

class MailtrapServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app['mail.manager']->extend('mailtrap', function () {
            $apiToken = config('mail.mailers.mailtrap.api_token');
            
            if (!$apiToken) {
                throw new \Exception('Mailtrap API token not configured in MAILTRAP_API_TOKEN');
            }

            return new MailtrapApiTransport(
                $apiToken,
                $this->app['http_client'],
                $this->app['log']
            );
        });
    }
}
