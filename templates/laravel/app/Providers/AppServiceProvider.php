<?php

namespace App\Providers;

use Authio\Authio;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Authio::class, function () {
            return new Authio([
                'api_key' => env('AUTHIO_SECRET_KEY', ''),
                'api_url' => env('AUTHIO_API_URL', 'https://api.authio.com'),
                'publishable_key' => env('AUTHIO_PUBLISHABLE_KEY', ''),
            ]);
        });
    }

    public function boot(): void
    {
        //
    }
}
