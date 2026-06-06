<?php

namespace App\Providers;

use App\Mail\Transport\MailtrapApiTransport;
use Illuminate\Support\ServiceProvider;

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
        // Register Mailtrap Email Sending API transport
        $this->app['mail.manager']->extend('mailtrap', function () {
            $apiToken = config('mail.mailers.mailtrap.api_token');
            
            if (!$apiToken) {
                throw new \Exception('Mailtrap API token not configured in MAILTRAP_API_TOKEN');
            }

            return new MailtrapApiTransport(
                $apiToken,
                null,
                $this->app['log']
            );
        });
    }
}
