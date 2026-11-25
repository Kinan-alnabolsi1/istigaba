<?php

namespace App\Modules\Chat;

use App\Support\Modules\ModuleServiceProvider;

final class ChatServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }
}
