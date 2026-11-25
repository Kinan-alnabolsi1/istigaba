<?php

namespace App\Support\RequestId;

use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;

/**
 * Per-request correlation id (CLAUDE.md §11). Stored in Laravel Context so it reaches
 * logs, error bodies and queued jobs dispatched during the request.
 */
final class RequestId
{
    public const HEADER = 'X-Request-Id';

    public const CONTEXT_KEY = 'request_id';

    /** Accepted client-supplied ids: 8–64 chars of letters, digits and dashes. */
    private const VALID = '/^[A-Za-z0-9-]{8,64}$/';

    /** Use the client's id when it is well-formed, otherwise generate a UUID v4. */
    public static function resolve(?string $incoming): string
    {
        if (is_string($incoming) && preg_match(self::VALID, $incoming) === 1) {
            return $incoming;
        }

        return (string) Str::uuid();
    }

    public static function set(string $id): void
    {
        Context::add(self::CONTEXT_KEY, $id);
    }

    public static function current(): ?string
    {
        $id = Context::get(self::CONTEXT_KEY);

        return is_string($id) ? $id : null;
    }
}
