<?php

namespace App\Modules\Integration;

use App\Support\Modules\ModuleServiceProvider;

final class IntegrationServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
