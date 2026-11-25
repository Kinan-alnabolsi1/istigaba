<?php

namespace App\Modules\Settings;

use App\Support\Modules\ModuleServiceProvider;

final class SettingsServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
