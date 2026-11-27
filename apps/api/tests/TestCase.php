<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;
use Tests\Contract\Concerns\ContractValidator;

abstract class TestCase extends BaseTestCase
{
    /** RefreshDatabase: also drop the native ENUM types so migrate:fresh can recreate them. */
    protected bool $dropTypes = true;

    /** One random JWT secret per test process; never committed (secret scan, H6). */
    private static ?string $jwtSecret = null;

    /**
     * Runs right after the application boots and before any trait (RefreshDatabase) touches the
     * database. Refuses to run against a database whose name does not end in "_test"
     * (CLAUDE.md §6: migrate:fresh only on the test database).
     */
    protected function refreshApplication(): void
    {
        parent::refreshApplication();

        $connection = (string) config('database.default');
        $name = (string) config("database.connections.{$connection}.database");

        if (! str_ends_with($name, '_test')) {
            throw new RuntimeException("Refusing to run tests against database [{$name}]: test databases must end in _test.");
        }

        config(['jwt.secret' => self::$jwtSecret ??= bin2hex(random_bytes(32))]);
    }

    /**
     * Each test request must authenticate like a fresh production request: Laravel keeps resolved
     * guards (and their cached user) and the JWT singletons keep the last token between calls
     * inside one test, which would hide a denylisted token.
     *
     * @param  array<string, mixed>  $parameters
     * @param  array<string, mixed>  $cookies
     * @param  array<string, mixed>  $files
     * @param  array<string, mixed>  $server
     */
    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        $this->app['auth']->forgetGuards();
        $this->app['tymon.jwt']->unsetToken();
        $this->app['tymon.jwt.auth']->unsetToken();

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }

    protected function setUp(): void
    {
        parent::setUp();

        if (! TestResponse::hasMacro('assertMatchesContract')) {
            /*
             * Validates status, headers and body of the response against docs/api/openapi.yaml.
             * The contract path is derived from the matched route (`api/v1/...`) unless given.
             */
            TestResponse::macro('assertMatchesContract', function (?string $path = null): TestResponse {
                /** @var TestResponse<Response> $this */
                ContractValidator::assert($this, $path);

                return $this;
            });
        }
    }
}
