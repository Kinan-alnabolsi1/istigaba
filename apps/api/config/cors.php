<?php

/*
| CORS for the web apps (H6). Origins come only from CORS_ALLOWED_ORIGINS (comma-separated);
| no wildcard. Bearer tokens are sent in headers, so credentials (cookies) are not needed.
*/

$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
)));

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => $origins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Accept-Language', 'Authorization', 'Content-Type', 'Idempotency-Key', 'X-Request-Id'],
    'exposed_headers' => ['X-Request-Id', 'Retry-After', 'Content-Language'],
    'max_age' => 600,
    'supports_credentials' => false,
];
