<?php

namespace App\Support\Http;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * API messages are localized by Accept-Language: `ar` (default) or `en` (CLAUDE.md §3.8).
 * Global so that errors for unmatched routes are localized too.
 */
final class SetLocaleFromAcceptLanguage
{
    /** First entry is the default. */
    public const SUPPORTED = ['ar', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->negotiate($request);
        App::setLocale($locale);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }

    private function negotiate(Request $request): string
    {
        foreach ($request->getLanguages() as $language) {
            $base = strtolower(explode('_', str_replace('-', '_', $language))[0]);
            if (in_array($base, self::SUPPORTED, true)) {
                return $base;
            }
        }

        return self::SUPPORTED[0];
    }
}
