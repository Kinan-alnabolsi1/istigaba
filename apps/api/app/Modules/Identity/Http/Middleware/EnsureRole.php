<?php

namespace App\Modules\Identity\Http\Middleware;

use App\Modules\Identity\DTOs\UserAccessData;
use App\Modules\Identity\Queries\UserAccessQuery;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * `role:<Role A>,<Role B>` (NFR-007): the caller's role must be one of the operation's
 * `x-required-roles`, otherwise 403. Also rejects deactivated accounts with 401 (the contract's
 * Unauthorized response covers deactivated users), so every authenticated route checks
 * `is_active` on every request. The access row is memoized on the request for `permission:`.
 */
final class EnsureRole
{
    public const ACCESS_ATTRIBUTE = 'identity.access';

    public function __construct(private readonly UserAccessQuery $access) {}

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $access = self::access($request, $this->access);

        if (! in_array($access->role, $roles, true)) {
            throw new AuthorizationException;
        }

        return $next($request);
    }

    /** @throws AuthenticationException */
    public static function access(Request $request, UserAccessQuery $query): UserAccessData
    {
        $cached = $request->attributes->get(self::ACCESS_ATTRIBUTE);
        if ($cached instanceof UserAccessData) {
            return $cached;
        }

        $id = $request->user()?->getAuthIdentifier();
        $access = is_string($id) ? $query->find($id) : null;

        if ($access === null || ! $access->isActive) {
            throw new AuthenticationException;
        }

        $request->attributes->set(self::ACCESS_ATTRIBUTE, $access);

        return $access;
    }
}
