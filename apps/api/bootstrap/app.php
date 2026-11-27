<?php

use App\Support\Exceptions\ErrorRenderer;
use App\Support\Health\HealthController;
use App\Support\Http\SecurityHeaders;
use App\Support\Http\SetLocaleFromAcceptLanguage;
use App\Support\RequestId\RequestIdMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__.'/../routes/console.php',
        // Module routes are loaded by each app/Modules/<Module>/<Module>ServiceProvider under /api/v1.
        // GET /health: outside /api/v1 and outside the contract (decision B5). Replaces Laravel's /up.
        then: function (): void {
            Route::get('/health', HealthController::class)->name('health');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global, outermost first: every response gets a request id, security headers and a locale.
        $middleware->prepend([RequestIdMiddleware::class, SecurityHeaders::class, SetLocaleFromAcceptLanguage::class]);
        // Passwords are never trimmed (the framework already skips `password`/`current_password`).
        $middleware->trimStrings(except: ['new_password']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        ErrorRenderer::register($exceptions);
    })->create();
