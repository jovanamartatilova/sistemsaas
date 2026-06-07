<?php

namespace App\Providers;

use Illuminate\Mail\MailManager;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Mailtrap\Transport as MailtrapTransport;
use Symfony\Component\Mailer\Transport\Dsn;

class MailtrapMailProvider extends ServiceProvider
{
    public function boot()
    {
        $this->app->make('mail.manager')->extend('mailtrap', function () {
            $apiToken = config('mail.mailers.mailtrap.api_token');
            
            if (!$apiToken) {
                throw new \Exception('Mailtrap API token not configured');
            }

            $dsn = new Dsn(
                'mailtrap+api',
                'default',
                '',
                '',
                null,
                [
                    'api_token' => $apiToken,
                ]
            );

            return new MailtrapTransport(
                null,
                $dsn
            );
        });
    }
}
