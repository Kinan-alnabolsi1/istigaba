<?php

/*
| Rate limits (NFR-011), approved table in apps/api/CLAUDE.md. Keyed per user when
| authenticated, per IP otherwise. Exceeding a limit returns 429 `rate_limited` + Retry-After.
| The login lockout (5 failures within 15 minutes, per account and per IP) is separate and
| returns 429 `account_locked` (docs/plans/S1.md §2.6).
*/

return [

    'login' => ['per_minute' => (int) env('RATE_LOGIN_PER_MINUTE', 10)],

    'register' => ['per_hour' => (int) env('RATE_REGISTER_PER_HOUR', 5)],

    'refresh' => ['per_minute' => (int) env('RATE_REFRESH_PER_MINUTE', 30)],

    'location' => ['per_minute' => (int) env('RATE_LOCATION_PER_MINUTE', 10)],

    'authenticated' => ['per_minute' => (int) env('RATE_AUTHENTICATED_PER_MINUTE', 120)],

    'unauthenticated' => ['per_minute' => (int) env('RATE_UNAUTHENTICATED_PER_MINUTE', 60)],

    'lockout' => [
        'max_failures' => (int) env('LOGIN_LOCKOUT_MAX_FAILURES', 5),
        'window_minutes' => (int) env('LOGIN_LOCKOUT_WINDOW_MINUTES', 15),
        'lock_minutes' => (int) env('LOGIN_LOCKOUT_MINUTES', 15),
    ],

];
