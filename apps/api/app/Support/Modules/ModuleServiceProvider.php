<?php

namespace App\Support\Modules;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * Base provider for app/Modules/<Module>. Loads the module's routes.php under the
 * versioned API prefix with the `api` middleware group. Route files group their own
 * audience scopes (/me, /operations, /field, /admin).
 */
abstract class ModuleServiceProvider extends ServiceProvider
{
    /** Absolute path of the module directory. */
    abstract protected function modulePath(): string;

    public function boot(): void
    {
        $routes = $this->modulePath().'/routes.php';

        if (is_file($routes) && ! $this->app->routesAreCached()) {
            Route::middleware('api')->prefix('api/v1')->group($routes);
        }
    }
}
