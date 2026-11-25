<?php

namespace App\Modules\Notifications;

use App\Support\Modules\ModuleServiceProvider;

final class NotificationsServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
