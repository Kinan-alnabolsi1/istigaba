<?php

namespace App\Modules\AiDrafts;

use App\Support\Modules\ModuleServiceProvider;

final class AiDraftsServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
