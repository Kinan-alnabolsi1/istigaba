<?php

namespace App\Support\Http;

/** The contract's phone format (openapi.yaml, all writable `phone` fields): E.164. */
final class PhoneRule
{
    public const E164 = '/^\+[1-9][0-9]{7,14}$/';
}
