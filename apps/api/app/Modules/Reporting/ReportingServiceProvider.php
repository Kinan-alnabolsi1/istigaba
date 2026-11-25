<?php

namespace App\Modules\Reporting;

use App\Support\Modules\ModuleServiceProvider;

final class ReportingServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
