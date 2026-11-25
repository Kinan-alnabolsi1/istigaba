<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /** RefreshDatabase: also drop the native ENUM types so migrate:fresh can recreate them. */
    protected bool $dropTypes = true;

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
    }
}
