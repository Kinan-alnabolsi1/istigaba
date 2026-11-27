<?php

use App\Modules\Identity\Http\Controllers\AdminRoleController;
use App\Modules\Identity\Http\Controllers\AuthController;
use App\Modules\Identity\Http\Controllers\MeController;
use Illuminate\Support\Facades\Route;

// Identity module routes, loaded under /api/v1 with the api middleware group by IdentityServiceProvider.
// Middleware must match each operation's x-required-roles / x-required-permissions / x-rate-limited
// (tests/Feature/Security/RouteAuthorizationTest.php).

$everyRole = 'role:Citizen,Dispatcher,Field Unit Representative,System Administrator';

// Public (security: []).
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('throttle:refresh');

// Every authenticated role.
Route::middleware(['auth:api', $everyRole, 'throttle:authenticated'])->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/me', [MeController::class, 'show']);
    Route::patch('/me', [MeController::class, 'update']);
    Route::post('/me/password', [MeController::class, 'changePassword']);
    Route::put('/me/location-consent', [MeController::class, 'updateLocationConsent']);
    Route::put('/me/location', [MeController::class, 'updateLocation'])->middleware('throttle:location');
});

// System Administrator with role.manage (FR-004).
Route::middleware(['auth:api', 'role:System Administrator', 'permission:role.manage', 'throttle:authenticated'])
    ->prefix('admin')
    ->group(function (): void {
        Route::get('/roles', [AdminRoleController::class, 'roles']);
        Route::get('/permissions', [AdminRoleController::class, 'permissions']);
        Route::put('/roles/{roleId}/permissions', [AdminRoleController::class, 'replacePermissions'])->whereNumber('roleId');
    });
