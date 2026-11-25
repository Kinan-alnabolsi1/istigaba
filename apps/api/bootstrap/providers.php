<?php

use App\Modules\AiDrafts\AiDraftsServiceProvider;
use App\Modules\Assignments\AssignmentsServiceProvider;
use App\Modules\Audit\AuditServiceProvider;
use App\Modules\Chat\ChatServiceProvider;
use App\Modules\Identity\IdentityServiceProvider;
use App\Modules\Integration\IntegrationServiceProvider;
use App\Modules\Notifications\NotificationsServiceProvider;
use App\Modules\Operations\OperationsServiceProvider;
use App\Modules\Reporting\ReportingServiceProvider;
use App\Modules\Settings\SettingsServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    IdentityServiceProvider::class,
    ReportingServiceProvider::class,
    AiDraftsServiceProvider::class,
    OperationsServiceProvider::class,
    AssignmentsServiceProvider::class,
    ChatServiceProvider::class,
    NotificationsServiceProvider::class,
    AuditServiceProvider::class,
    SettingsServiceProvider::class,
    IntegrationServiceProvider::class,
];
