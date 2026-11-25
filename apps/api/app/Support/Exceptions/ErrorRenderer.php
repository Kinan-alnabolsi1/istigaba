<?php

namespace App\Support\Exceptions;

use App\Support\RequestId\RequestId;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

/**
 * The one place that turns exceptions into the contract error body
 * `{code, message, request_id}` (+ `errors` on 422). Messages are localized from
 * lang/{ar,en}/errors.php and never contain exception text, traces or personal data.
 * Only codes defined in docs/api/openapi.yaml are used.
 */
final class ErrorRenderer
{
    /** Status → contract code for generic HTTP errors. */
    private const STATUS_CODES = [
        400 => 'malformed_request',
        401 => 'unauthenticated',
        403 => 'forbidden',
        404 => 'not_found',
        409 => 'invalid_state_transition',
        422 => 'validation_failed',
        429 => 'rate_limited',
    ];

    public static function register(Exceptions $exceptions): void
    {
        $exceptions->render(function (Throwable $e, Request $request): ?JsonResponse {
            return self::appliesTo($request) ? self::render($e) : null;
        });
    }

    public static function appliesTo(Request $request): bool
    {
        return $request->is('api', 'api/*', 'health') || $request->expectsJson();
    }

    public static function render(Throwable $e): JsonResponse
    {
        [$status, $code, $headers, $errors] = self::classify($e);

        $body = [
            'code' => $code,
            'message' => self::message($code),
            'request_id' => RequestId::current(),
        ];
        if ($errors !== null) {
            $body['errors'] = $errors;
        }

        return new JsonResponse($body, $status, $headers);
    }

    /**
     * @return array{0: int, 1: string, 2: array<string, string>, 3: array<string, array<int, string>>|null}
     */
    private static function classify(Throwable $e): array
    {
        return match (true) {
            $e instanceof DomainException => [$e->status(), $e->errorCode(), $e->headers(), null],
            $e instanceof ValidationException => [422, 'validation_failed', [], $e->errors()],
            $e instanceof AuthenticationException => [401, 'unauthenticated', [], null],
            $e instanceof AuthorizationException, $e instanceof AccessDeniedHttpException => [403, 'forbidden', [], null],
            // A wrong method is reported as not_found: the contract defines no 405 code.
            $e instanceof ModelNotFoundException,
            $e instanceof NotFoundHttpException,
            $e instanceof MethodNotAllowedHttpException => [404, 'not_found', [], null],
            $e instanceof TooManyRequestsHttpException => [429, 'rate_limited', self::stringHeaders($e->getHeaders()), null],
            $e instanceof BadRequestHttpException => [400, 'malformed_request', [], null],
            $e instanceof HttpExceptionInterface => self::fromHttpException($e),
            default => [500, 'internal_error', [], null],
        };
    }

    /**
     * @return array{0: int, 1: string, 2: array<string, string>, 3: null}
     */
    private static function fromHttpException(HttpExceptionInterface $e): array
    {
        $status = $e->getStatusCode();
        $code = self::STATUS_CODES[$status] ?? 'internal_error';

        return [$status, $code, self::stringHeaders($e->getHeaders()), null];
    }

    /**
     * @param  array<array-key, mixed>  $headers
     * @return array<string, string>
     */
    private static function stringHeaders(array $headers): array
    {
        $out = [];
        foreach ($headers as $name => $value) {
            if (is_string($name) && is_scalar($value)) {
                $out[$name] = (string) $value;
            }
        }

        return $out;
    }

    private static function message(string $code): string
    {
        $key = "errors.{$code}";
        $message = trans($key);

        return is_string($message) && $message !== $key ? $message : (string) trans('errors.internal_error');
    }
}
