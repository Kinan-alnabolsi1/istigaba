<?php

use Illuminate\Support\Facades\DB;

it('S0 GET /health returns status only', function () {
    $this->getJson('/health')
        ->assertOk()
        ->assertExactJson(['status' => 'ok'])
        ->assertHeader('Cache-Control', 'no-store, private');
})->group('S0');

it('S0 health returns 503 with status only when the database is unreachable', function () {
    config(['database.connections.pgsql.port' => 1]);
    DB::purge('pgsql');

    $this->getJson('/health')
        ->assertStatus(503)
        ->assertExactJson(['status' => 'unavailable']);
})->group('S0');

it('S0 health lives outside the versioned API and the default /up route is gone', function () {
    $this->getJson('/api/v1/health')->assertNotFound();
    $this->get('/up')->assertNotFound();
})->group('S0');
