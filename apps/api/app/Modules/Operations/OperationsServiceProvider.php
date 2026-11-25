<?php

namespace App\Modules\Operations;

use App\Support\Modules\ModuleServiceProvider;

final class OperationsServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
