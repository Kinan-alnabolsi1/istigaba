<?php

namespace App\Providers;

use App\Support\RateLimiting\RateLimits;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Laravel\Telescope\TelescopeServiceProvider as TelescopePackageProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Telescope: local only (CLAUDE.md §11). It is a dev dependency and is not auto-discovered.
        if ($this->app->environment('local') && class_exists(TelescopePackageProvider::class)) {
            $this->app->register(TelescopePackageProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
            // Telescope's tables exist only in the local dev database: its migration is loaded from the
            // package here instead of being published into database/migrations, so the test database
            // (and the schema-drift check, decision B2) never sees them.
            $this->loadMigrationsFrom(base_path('vendor/laravel/telescope/database/migrations'));
        }
    }

    public function boot(): void
    {
        // DBML `timestamptz` means PostgreSQL's default (microsecond) precision. Laravel defaults to
        // timestamp(0), which truncates to seconds and fails the schema-drift check.
        Schema::defaultTimePrecision(null);

        // Contract: single resources are returned unwrapped; lists wrap themselves in {data, meta}.
        JsonResource::withoutWrapping();

        RateLimits::register();
    }
}
