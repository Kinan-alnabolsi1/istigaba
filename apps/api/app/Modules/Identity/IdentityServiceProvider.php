<?php

namespace App\Modules\Identity;

use App\Modules\Identity\Http\Middleware\EnsurePermission;
use App\Modules\Identity\Http\Middleware\EnsureRole;
use App\Modules\Identity\Models\Role;
use App\Modules\Identity\Policies\RolePolicy;
use App\Support\Modules\ModuleServiceProvider;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Gate;

final class IdentityServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }

    public function boot(): void
    {
        // Authorization middleware used by every module's routes (NFR-007).
        $router = $this->app->make(Router::class);
        $router->aliasMiddleware('role', EnsureRole::class);
        $router->aliasMiddleware('permission', EnsurePermission::class);

        Gate::policy(Role::class, RolePolicy::class);

        parent::boot();
    }
}
