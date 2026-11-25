<?php

namespace App\Modules\Audit;

use App\Support\Modules\ModuleServiceProvider;

final class AuditServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
