<?php

namespace App\Support\Logging;

use App\Support\RequestId\RequestId;
use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

/** Adds the current request_id to every log record's `extra` (CLAUDE.md §11). */
final class RequestContextProcessor implements ProcessorInterface
{
    public function __invoke(LogRecord $record): LogRecord
    {
        $id = RequestId::current();
        if ($id === null) {
            return $record;
        }

        return $record->with(extra: [...$record->extra, 'request_id' => $id]);
    }
}
