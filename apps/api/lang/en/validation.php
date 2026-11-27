<?php

// Merged over the framework's English validation messages: only the API's own additions. The
// attribute names are needed because the fallback locale is Arabic.
return [
    'unknown_field' => 'The :attribute field is not allowed.',
    'empty_body' => 'Send at least one field.',

    'attributes' => [
        'full_name' => 'full name',
        'email' => 'email',
        'phone' => 'phone',
        'password' => 'password',
        'current_password' => 'current password',
        'new_password' => 'new password',
        'refresh_token' => 'refresh token',
        'location_consent' => 'location consent',
        'location' => 'location',
        'location.latitude' => 'latitude',
        'location.longitude' => 'longitude',
        'permission_ids' => 'permissions',
        'permission_ids.*' => 'permission',
    ],
];
