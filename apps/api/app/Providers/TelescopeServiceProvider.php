<?php

namespace App\Providers;

use Laravel\Telescope\Telescope;
use Laravel\Telescope\TelescopeApplicationServiceProvider;

/**
 * Telescope runs only when APP_ENV=local (registered from AppServiceProvider, CLAUDE.md §11).
 * Even locally it must not record secrets or personal data (H6).
 */
final class TelescopeServiceProvider extends TelescopeApplicationServiceProvider
{
    public function register(): void
    {
        Telescope::hideRequestHeaders([
            'authorization', 'cookie', 'x-csrf-token', 'x-xsrf-token', 'idempotency-key', 'x-internal-key',
        ]);

        Telescope::hideRequestParameters([
            'password', 'password_confirmation', 'current_password', 'new_password',
            'refresh_token', 'access_token', 'token', 'phone', 'email', 'reason',
            'location', 'latitude', 'longitude',
        ]);

        Telescope::hideResponseParameters(['access_token', 'refresh_token', 'phone', 'email']);
    }

    /** Local only, so the dashboard is open to anyone who can reach the dev machine. */
    protected function gate(): void
    {
        // No gate: the provider is never registered outside APP_ENV=local.
    }
}
