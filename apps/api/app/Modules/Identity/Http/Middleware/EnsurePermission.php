<?php

namespace App\Modules\Identity\Http\Middleware;

use App\Modules\Identity\Queries\UserAccessQuery;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * `permission:<code>[,<code>]` (NFR-007): the caller's role must hold every listed D-34 code
 * (from `role_permissions`, read fresh per request), otherwise 403.
 */
final class EnsurePermission
{
    public function __construct(private readonly UserAccessQuery $access) {}

    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $access = EnsureRole::access($request, $this->access);

        foreach ($permissions as $permission) {
            if (! $access->can($permission)) {
                throw new AuthorizationException;
            }
        }

        return $next($request);
    }
}
