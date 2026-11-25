<?php

namespace App\Modules\Assignments;

use App\Support\Modules\ModuleServiceProvider;

final class AssignmentsServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
