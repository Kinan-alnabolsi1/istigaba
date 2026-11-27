<?php

use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Tests\Contract\Concerns\ContractValidator;

/*
| NFR-007 (CLAUDE.md §3.2): every API route must carry exactly the authorization middleware its
| contract operation declares. Fails for any route that is not in openapi.yaml, a protected route
| without `auth:api`, a `role:` set different from `x-required-roles`, a missing
| `permission:` for an `x-required-permissions` code, or an `x-rate-limited` operation without a
| named `throttle:` limiter. /health is off-contract (decision B5) and outside /api/v1.
*/

/** @return list<array{method: string, path: string, middleware: list<string>}> */
function apiRoutes(): array
{
    $routes = [];
    /** @var RoutingRoute $route */
    foreach (Route::getRoutes()->getRoutes() as $route) {
        if (! str_starts_with($route->uri(), 'api/v1')) {
            continue;
        }
        foreach ($route->methods() as $method) {
            if ($method === 'HEAD') {
                continue;
            }
            $routes[] = [
                'method' => strtolower($method),
                'path' => '/'.ltrim(substr($route->uri(), strlen('api/v1')), '/'),
                'middleware' => array_values(array_map('strval', $route->gatherMiddleware())),
            ];
        }
    }

    return $routes;
}

/** @param list<string> $middleware @return list<string> */
function middlewareArguments(array $middleware, string $name): array
{
    $args = [];
    foreach ($middleware as $m) {
        if (str_starts_with($m, "{$name}:")) {
            array_push($args, ...explode(',', substr($m, strlen($name) + 1)));
        }
    }
    sort($args);

    return $args;
}

it('NFR-007 the S1 routes exist (the check is not vacuous)', function () {
    expect(count(apiRoutes()))->toBeGreaterThanOrEqual(12);
})->group('NFR-007');

it('NFR-007 every API route is a contract operation with matching authorization middleware', function () {
    $paths = ContractValidator::document()['paths'];
    $violations = [];

    foreach (apiRoutes() as ['method' => $method, 'path' => $path, 'middleware' => $middleware]) {
        $operation = $paths[$path][$method] ?? null;
        if (! is_array($operation)) {
            $violations[] = "{$method} {$path}: not in openapi.yaml";

            continue;
        }

        $public = array_key_exists('security', $operation) && $operation['security'] === [];
        $hasAuth = in_array('auth:api', $middleware, true);

        if ($public) {
            if ($hasAuth) {
                $violations[] = "{$method} {$path}: public operation must not require auth";
            }
        } else {
            if (! $hasAuth) {
                $violations[] = "{$method} {$path}: missing auth:api";
            }
            $roles = $operation['x-required-roles'] ?? [];
            sort($roles);
            if (middlewareArguments($middleware, 'role') !== $roles) {
                $violations[] = "{$method} {$path}: role middleware ".json_encode(middlewareArguments($middleware, 'role')).' != '.json_encode($roles);
            }
        }

        $permissions = $operation['x-required-permissions'] ?? [];
        sort($permissions);
        if (middlewareArguments($middleware, 'permission') !== $permissions) {
            $violations[] = "{$method} {$path}: permission middleware ".json_encode(middlewareArguments($middleware, 'permission')).' != '.json_encode($permissions);
        }

        if (($operation['x-rate-limited'] ?? false) === true && middlewareArguments($middleware, 'throttle') === []) {
            $violations[] = "{$method} {$path}: x-rate-limited but no throttle limiter";
        }
    }

    expect($violations)->toBe([]);
})->group('NFR-007', 'NFR-011', 'FR-004');
