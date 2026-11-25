<?php

namespace App\Modules\Identity;

use App\Support\Modules\ModuleServiceProvider;

final class IdentityServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
