<?php

namespace App\Support\Health;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * GET /health (CLAUDE.md §11, decision B5): public, outside /api/v1 and outside the contract.
 * Returns status only: no version, environment or dependency details.
 */
final class HealthController
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::select('select 1');
            $ok = true;
        } catch (Throwable) {
            $ok = false;
        }

        return new JsonResponse(
            ['status' => $ok ? 'ok' : 'unavailable'],
            $ok ? 200 : 503,
            ['Cache-Control' => 'no-store, private'],
        );
    }
}
