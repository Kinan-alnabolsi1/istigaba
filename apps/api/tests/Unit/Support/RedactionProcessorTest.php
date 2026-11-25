<?php

use App\Support\Logging\RedactionProcessor;
use Illuminate\Support\Facades\Log;
use Monolog\Level;
use Monolog\LogRecord;

function s0Record(array $context, string $message = 'event'): LogRecord
{
    return new LogRecord(new DateTimeImmutable, 'test', Level::Info, $message, $context);
}

it('NFR-012 redacts secrets and personal data at any depth of the log context', function () {
    $record = (new RedactionProcessor)(s0Record([
        'password' => 'hunter2',
        'Authorization' => 'Bearer abc.def.ghi',
        'user' => ['name' => 'kept', 'phone' => '+963900000000', 'email' => 'a@b.c'],
        'point' => ['latitude' => 33.51, 'longitude' => 36.29],
        'nested' => ['deep' => ['refresh_token' => 'r-1', 'Idempotency-Key' => 'k']],
        'status' => 200,
    ]));

    expect($record->context['password'])->toBe('[REDACTED]')
        ->and($record->context['Authorization'])->toBe('[REDACTED]')
        ->and($record->context['user'])->toBe(['name' => 'kept', 'phone' => '[REDACTED]', 'email' => '[REDACTED]'])
        ->and($record->context['point'])->toBe(['latitude' => '[REDACTED]', 'longitude' => '[REDACTED]'])
        ->and($record->context['nested']['deep'])->toBe(['refresh_token' => '[REDACTED]', 'Idempotency-Key' => '[REDACTED]'])
        ->and($record->context['status'])->toBe(200);
})->group('NFR-012');

it('NFR-012 redacts bearer tokens and JWTs inside the message text', function () {
    $jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl';
    $record = (new RedactionProcessor)(s0Record([], "refresh failed for Bearer {$jwt} and raw {$jwt}"));

    expect($record->message)->not->toContain($jwt)->toContain('[REDACTED]');
})->group('NFR-012');

it('NFR-012 the json channel writes one JSON line with request_id and redacted context', function () {
    $path = storage_path('framework/testing/s0-json-'.uniqid().'.log');
    config(['logging.channels.json.path' => $path, 'logging.channels.json.driver' => 'single']);

    $this->getJson('/health', ['X-Request-Id' => 'log-test-req-01']);
    Log::channel('json')->info('s0.probe', ['password' => 'p', 'phone' => '+963', 'route' => 'health']);

    $lines = array_values(array_filter(explode("\n", (string) file_get_contents($path))));
    $entry = json_decode((string) end($lines), true, flags: JSON_THROW_ON_ERROR);
    @unlink($path);

    expect($entry['message'])->toBe('s0.probe')
        ->and($entry['context']['password'])->toBe('[REDACTED]')
        ->and($entry['context']['phone'])->toBe('[REDACTED]')
        ->and($entry['context']['route'])->toBe('health')
        ->and($entry['extra']['request_id'])->toBe('log-test-req-01');
})->group('NFR-012');
