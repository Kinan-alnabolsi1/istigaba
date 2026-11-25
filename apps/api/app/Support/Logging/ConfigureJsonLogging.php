<?php

namespace App\Support\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\JsonFormatter;
use Monolog\Handler\FormattableHandlerInterface;
use Monolog\Logger as Monolog;

/**
 * `tap` for the `json` channel: one JSON object per line, request_id in `extra`,
 * redaction applied last so it also covers values added by other processors.
 */
final class ConfigureJsonLogging
{
    public function __invoke(Logger $logger): void
    {
        $monolog = $logger->getLogger();
        if (! $monolog instanceof Monolog) {
            return;
        }

        foreach ($monolog->getHandlers() as $handler) {
            if ($handler instanceof FormattableHandlerInterface) {
                $handler->setFormatter(new JsonFormatter(JsonFormatter::BATCH_MODE_NEWLINES, true, true));
            }
        }

        // Monolog runs processors last-pushed-first: push redaction first so it runs last.
        $monolog->pushProcessor(new RedactionProcessor);
        $monolog->pushProcessor(new RequestContextProcessor);
    }
}
