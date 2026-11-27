<?php

/*
| Password hashing (D-06, NFR-006): Argon2id everywhere. Cost parameters default to PHP's
| Argon2id defaults; tests lower them through phpunit.xml so the suite stays fast while the
| algorithm (and the `$argon2id$` prefix) is unchanged.
*/

return [

    'driver' => 'argon2id',

    'argon' => [
        'memory' => (int) env('ARGON_MEMORY', 65536),
        'threads' => (int) env('ARGON_THREADS', 1),
        'time' => (int) env('ARGON_TIME', 4),
        'verify' => true,
    ],

    'rehash_on_login' => false,

];
