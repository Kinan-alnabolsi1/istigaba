<?php

namespace App\Modules\Identity\Http\Controllers;

use App\Modules\Identity\DTOs\RequestContextData;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

/** The authenticated caller's id and request context, without touching the User model. */
trait ResolvesCaller
{
    protected function callerId(Request $request): string
    {
        $id = $request->user()?->getAuthIdentifier();
        if (! is_string($id)) {
            throw new AuthenticationException;
        }

        return $id;
    }

    protected function context(Request $request): RequestContextData
    {
        return new RequestContextData($request->ip(), $request->bearerToken());
    }
}
