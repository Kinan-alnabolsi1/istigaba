<?php

namespace App\Support\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

/**
 * Central log redaction (H6, NFR-012). Masks secrets and personal data in context/extra at any
 * depth, and bearer tokens / JWTs inside the message text. Applied to every app log channel.
 */
final class RedactionProcessor implements ProcessorInterface
{
    public const MASK = '[REDACTED]';

    /** Key fragments (case-insensitive, matched against the normalized key) whose values are masked. */
    private const SENSITIVE = [
        'password', 'passwd', 'secret', 'token', 'authorization', 'cookie', 'api_key', 'apikey',
        'internal_key', 'idempotency', 'phone', 'email', 'latitude', 'longitude', 'lat', 'lng', 'lon',
        'location', 'coordinates', 'reason', 'body', 'transcript', 'audio', 'input_text', 'full_name',
    ];

    /** Bearer tokens and compact JWTs inside free text. */
    private const TEXT_PATTERNS = [
        '/Bearer\s+[A-Za-z0-9._~+\/=-]+/i',
        '/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/',
    ];

    public function __invoke(LogRecord $record): LogRecord
    {
        return $record->with(
            message: self::redactText($record->message),
            context: self::redact($record->context),
            extra: self::redact($record->extra),
        );
    }

    /**
     * @param  array<array-key, mixed>  $data
     * @return array<array-key, mixed>
     */
    public static function redact(array $data): array
    {
        $out = [];
        foreach ($data as $key => $value) {
            if (is_string($key) && self::isSensitive($key)) {
                $out[$key] = self::MASK;
            } elseif (is_array($value)) {
                $out[$key] = self::redact($value);
            } elseif (is_string($value)) {
                $out[$key] = self::redactText($value);
            } else {
                $out[$key] = $value;
            }
        }

        return $out;
    }

    public static function redactText(string $text): string
    {
        return (string) preg_replace(self::TEXT_PATTERNS, self::MASK, $text);
    }

    private static function isSensitive(string $key): bool
    {
        $normalized = strtolower(str_replace('-', '_', $key));
        $parts = explode('_', $normalized);

        foreach (self::SENSITIVE as $needle) {
            // Short keys (lat, lng, lon) only match whole words; longer ones match anywhere.
            if (strlen($needle) <= 3 ? in_array($needle, $parts, true) : str_contains($normalized, $needle)) {
                return true;
            }
        }

        return false;
    }
}
