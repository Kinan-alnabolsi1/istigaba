<?php

namespace App\Support\Exceptions;

use RuntimeException;

/**
 * Base class for typed domain errors. The single error renderer maps each one to
 * `{code, message, request_id}` with its HTTP status (e.g. InvalidStateTransition → 409).
 * The message shown to clients always comes from lang/{ar,en}/errors.php, never from here.
 */
abstract class DomainException extends RuntimeException
{
    /** HTTP status code for this error (409, 422, …). */
    abstract public function status(): int;

    /** Stable machine-readable code from the contract (e.g. `invalid_state_transition`). */
    abstract public function errorCode(): string;

    /**
     * Extra response headers (e.g. Retry-After).
     *
     * @return array<string, string>
     */
    public function headers(): array
    {
        return [];
    }
}
