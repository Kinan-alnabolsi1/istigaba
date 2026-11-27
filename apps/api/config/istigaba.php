<?php

/*
| Application settings that are not framework configuration.
*/

return [

    'auth' => [
        // Opaque refresh tokens (rotated, stored as sha256 in refresh_tokens).
        'refresh_ttl_days' => (int) env('REFRESH_TOKEN_TTL_DAYS', 30),
    ],

    // First System Administrator (docs/seed-proposal.md). FirstAdminSeeder refuses to run without
    // an email and password, and in production refuses the example password below.
    'first_admin' => [
        'name' => env('ADMIN_NAME', 'System Administrator'),
        'email' => env('ADMIN_EMAIL'),
        'phone' => env('ADMIN_PHONE'),
        'password' => env('ADMIN_PASSWORD'),
        'example_password' => 'change-me-admin',
    ],

];
