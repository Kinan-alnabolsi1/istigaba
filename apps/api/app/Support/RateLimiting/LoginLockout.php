<?php

namespace App\Support\RateLimiting;

use Illuminate\Support\Facades\Cache;

/**
 * Login lockout (H6, docs/plans/S1.md §2.6): `max_failures` failures within `window_minutes` lock
 * the key for `lock_minutes`. Two independent keys: the submitted email (hashed, whether or not an
 * account exists, so a lock never proves an email is registered) and the client IP. A success
 * clears only the account counter. Wrong current passwords on /me/password count on the account
 * key only (plan Q4).
 */
final class LoginLockout
{
    public const SCOPE_ACCOUNT = 'account';

    public const SCOPE_IP = 'ip';

    /** @throws AccountLocked */
    public function ensureNotLocked(string $email, ?string $ip): void
    {
        $remaining = 0;
        foreach ($this->keys($email, $ip) as $key) {
            $until = Cache::get("{$key}:until");
            if (is_int($until)) {
                $remaining = max($remaining, $until - now()->getTimestamp());
            }
        }

        if ($remaining > 0) {
            throw new AccountLocked($remaining);
        }
    }

    /**
     * Counts one failure on each key and returns the scopes whose lock started now.
     *
     * @return list<array{scope: string, locked_until: string}>
     */
    public function recordFailure(string $email, ?string $ip): array
    {
        $max = (int) config('rate-limits.lockout.max_failures');
        $window = (int) config('rate-limits.lockout.window_minutes') * 60;
        $lock = (int) config('rate-limits.lockout.lock_minutes') * 60;

        $started = [];
        foreach ($this->keys($email, $ip) as $scope => $key) {
            Cache::add("{$key}:count", 0, $window);
            $count = (int) Cache::increment("{$key}:count");

            if ($count >= $max) {
                $until = now()->addSeconds($lock);
                Cache::put("{$key}:until", $until->getTimestamp(), $lock);
                Cache::forget("{$key}:count");
                $started[] = ['scope' => $scope, 'locked_until' => $until->utc()->format('Y-m-d\TH:i:s\Z')];
            }
        }

        return $started;
    }

    public function clearAccount(string $email): void
    {
        Cache::forget($this->accountKey($email).':count');
    }

    /** @return array<string, string> scope => cache key prefix */
    private function keys(string $email, ?string $ip): array
    {
        $keys = [self::SCOPE_ACCOUNT => $this->accountKey($email)];
        if ($ip !== null) {
            $keys[self::SCOPE_IP] = 'login-lockout:ip:'.$ip;
        }

        return $keys;
    }

    private function accountKey(string $email): string
    {
        return 'login-lockout:acct:'.hash('sha256', $email);
    }
}
