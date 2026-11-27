<?php

use PHPOpenSourceSaver\JWTAuth\Providers\Auth\Illuminate;
use PHPOpenSourceSaver\JWTAuth\Providers\JWT\Lcobucci;

/*
| JWT access tokens (NFR-006, docs/plans/S1.md §2.3).
| Access tokens live 15 minutes. Refresh tokens are NOT JWTs: they are opaque, rotated and stored
| hashed in `refresh_tokens` (config/istigaba.php `auth.refresh_ttl_days`). The package's own
| "refresh a JWT" flow is not used, so `refresh_ttl` only bounds how long a denylisted `jti`
| stays in the cache (blacklist entries live for `exp + refresh_ttl`).
*/

return [

    'secret' => env('JWT_SECRET'),

    'keys' => [
        'public' => env('JWT_PUBLIC_KEY'),
        'private' => env('JWT_PRIVATE_KEY'),
        'passphrase' => env('JWT_PASSPHRASE'),
    ],

    // Minutes.
    'ttl' => (int) env('JWT_TTL', 15),

    'refresh_iat' => false,

    // Minutes. Kept equal to the access TTL: see the note above.
    'refresh_ttl' => (int) env('JWT_TTL', 15),

    'algo' => env('JWT_ALGO', 'HS256'),

    // No custom claims: the token carries no email, name, phone or role (H6).
    'required_claims' => [
        'iss',
        'iat',
        'exp',
        'nbf',
        'sub',
        'jti',
    ],

    'persistent_claims' => [],

    'lock_subject' => true,

    'leeway' => (int) env('JWT_LEEWAY', 0),

    // Logout `jti` denylist (FR-003, D-05): always on, no grace period.
    'blacklist_enabled' => true,

    'blacklist_grace_period' => 0,

    // MUST stay true: in jwt-auth 2.x this flag gates the blacklist check itself (Manager::decode),
    // not just the error text. false silently disables the logout denylist. The guard still turns
    // the exception into a plain 401 `unauthenticated`.
    'show_black_list_exception' => true,

    'decrypt_cookies' => false,

    'cookie_key_name' => 'token',

    'providers' => [
        'jwt' => Lcobucci::class,
        'auth' => Illuminate::class,
        'storage' => PHPOpenSourceSaver\JWTAuth\Providers\Storage\Illuminate::class,
    ],

];
