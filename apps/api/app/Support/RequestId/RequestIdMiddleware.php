<?php

namespace App\Support\RequestId;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Global, first middleware: assigns the request id, echoes it in X-Request-Id and writes
 * one structured access log line per request (method, route template, status, duration).
 * Never logs bodies, query strings, headers or user input (H6).
 */
final class RequestIdMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $id = RequestId::resolve($request->headers->get(RequestId::HEADER));
        RequestId::set($id);
        $request->attributes->set(RequestId::CONTEXT_KEY, $id);
        $request->attributes->set('istigaba.started_at', hrtime(true));

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set(RequestId::HEADER, $id);

        return $response;
    }

    public function terminate(Request $request, Response $response): void
    {
        $started = $request->attributes->get('istigaba.started_at');
        $durationMs = is_int($started) ? round((hrtime(true) - $started) / 1_000_000, 1) : null;
        $route = $request->route();

        Log::info('http.request', [
            'method' => $request->getMethod(),
            // Route template only (e.g. api/v1/me/reports/{reportId}): never the concrete URL or query string.
            'route' => $route instanceof Route ? $route->uri() : 'unmatched',
            'status' => $response->getStatusCode(),
            'duration_ms' => $durationMs,
        ]);
    }
}
