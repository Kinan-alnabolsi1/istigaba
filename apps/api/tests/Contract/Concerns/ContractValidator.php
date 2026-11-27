<?php

namespace Tests\Contract\Concerns;

use Illuminate\Routing\Route;
use Illuminate\Testing\TestResponse;
use Osteel\OpenApi\Testing\ValidatorBuilder;
use Osteel\OpenApi\Testing\ValidatorInterface;
use PHPUnit\Framework\Assert;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Yaml\Yaml;
use Throwable;

/**
 * Contract helper (CLAUDE.md §3.5): every asserted API response is validated against
 * docs/api/openapi.yaml. The parsed document is cached per process.
 */
final class ContractValidator
{
    private static ?ValidatorInterface $validator = null;

    /** @var array<string, mixed>|null */
    private static ?array $document = null;

    public static function path(): string
    {
        return dirname(__DIR__, 5).'/docs/api/openapi.yaml';
    }

    /** @return array<string, mixed> */
    public static function document(): array
    {
        if (self::$document === null) {
            $parsed = Yaml::parseFile(self::path());
            if (! is_array($parsed)) {
                throw new RuntimeException('openapi.yaml did not parse to an array.');
            }
            self::$document = $parsed;
        }

        return self::$document;
    }

    /** @param TestResponse<Response> $response */
    public static function assert(TestResponse $response, ?string $path = null): void
    {
        $request = $response->baseRequest;
        $method = strtolower($request->getMethod());

        if ($path === null) {
            $route = $request->route();
            if (! $route instanceof Route) {
                throw new RuntimeException('assertMatchesContract(): no matched route; pass the contract path.');
            }
            $path = '/'.ltrim((string) preg_replace('#^api/v1#', '', $route->uri()), '/');
        }

        self::$validator ??= ValidatorBuilder::fromYamlFile(self::path())->getValidator();

        try {
            self::$validator->validate($response->baseResponse, $path, $method);
        } catch (Throwable $e) {
            Assert::fail("Response {$response->status()} for {$method} {$path} violates the contract: {$e->getMessage()}");
        }

        Assert::assertTrue(true);
    }
}
