<?php

namespace App\Support\RateLimiting;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Named limiters for `throttle:<name>` (NFR-011, config/rate-limits.php). Keyed per user when
 * authenticated, per IP otherwise. Exceeding one throws ThrottleRequestsException, which the error
 * renderer maps to 429 `rate_limited` + Retry-After.
 */
final class RateLimits
{
    public static function register(): void
    {
        RateLimiter::for('login', fn (Request $r) => Limit::perMinute(self::limit('login.per_minute'))->by(self::ip($r)));
        RateLimiter::for('register', fn (Request $r) => Limit::perHour(self::limit('register.per_hour'))->by(self::ip($r)));
        RateLimiter::for('refresh', fn (Request $r) => Limit::perMinute(self::limit('refresh.per_minute'))->by(self::ip($r)));
        RateLimiter::for('location', fn (Request $r) => Limit::perMinute(self::limit('location.per_minute'))->by(self::userOrIp($r)));
        RateLimiter::for('authenticated', fn (Request $r) => Limit::perMinute(self::limit('authenticated.per_minute'))->by(self::userOrIp($r)));
        RateLimiter::for('unauthenticated', fn (Request $r) => Limit::perMinute(self::limit('unauthenticated.per_minute'))->by(self::ip($r)));
    }

    private static function limit(string $key): int
    {
        return (int) config("rate-limits.{$key}");
    }

    private static function ip(Request $request): string
    {
        return 'ip:'.$request->ip();
    }

    private static function userOrIp(Request $request): string
    {
        $id = $request->user()?->getAuthIdentifier();

        return is_scalar($id) ? 'user:'.$id : self::ip($request);
    }
}
