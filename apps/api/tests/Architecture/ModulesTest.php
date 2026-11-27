<?php

/*
| Module boundaries (apps/api/CLAUDE.md "Pest architecture tests (S0, mandatory)").
| NFR-021: the design must accept future expansion, so modules stay isolated.
*/

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Resources\Json\JsonResource;

const S0_MODULES = [
    'Identity', 'Reporting', 'AiDrafts', 'Operations', 'Assignments',
    'Chat', 'Notifications', 'Audit', 'Settings', 'Integration',
];

/** Namespaces of other modules that a module must never reach into. */
function s0ForeignInternals(string $module): array
{
    $out = [];
    foreach (S0_MODULES as $other) {
        if ($other === $module) {
            continue;
        }
        foreach (['Models', 'Queries', 'Policies', 'Http', 'Jobs', 'Listeners'] as $layer) {
            $out[] = "App\\Modules\\{$other}\\{$layer}";
        }
    }

    return $out;
}

function s0AllOf(string $layer): array
{
    return array_map(fn (string $m) => "App\\Modules\\{$m}\\{$layer}", S0_MODULES);
}

foreach (S0_MODULES as $module) {
    $ns = "App\\Modules\\{$module}";

    arch("NFR-021 {$module}: controllers never touch models, queries or the DB facade")
        ->expect("{$ns}\\Http\\Controllers")
        ->not->toUse(['Illuminate\Database\Eloquent', 'Illuminate\Support\Facades\DB', ...s0AllOf('Models'), ...s0AllOf('Queries')])
        ->group('NFR-021');

    arch("NFR-021 {$module}: crosses modules only through Actions, DTOs, Events and Enums")
        ->expect($ns)
        ->not->toUse(s0ForeignInternals($module))
        ->group('NFR-021');

    arch("NFR-021 {$module}: actions are final, suffixed Action and never build HTTP responses")
        ->expect("{$ns}\\Actions")
        ->toBeFinal()
        ->toHaveSuffix('Action')
        ->not->toUse([
            'Illuminate\Http\Response', 'Illuminate\Http\JsonResponse', 'Illuminate\Http\Resources',
            'Symfony\Component\HttpFoundation\Response', 'response',
        ])
        ->group('NFR-021');

    arch("NFR-021 {$module}: DTOs are readonly and suffixed Data")
        ->expect("{$ns}\\DTOs")
        ->toBeReadonly()
        ->toHaveSuffix('Data')
        ->group('NFR-021');

    arch("NFR-021 {$module}: requests are FormRequests suffixed Request")
        ->expect("{$ns}\\Http\\Requests")
        ->toExtend(FormRequest::class)
        ->toHaveSuffix('Request')
        ->group('NFR-021');

    arch("NFR-021 {$module}: resources are JsonResources suffixed Resource")
        ->expect("{$ns}\\Http\\Resources")
        ->toExtend(JsonResource::class)
        ->toHaveSuffix('Resource')
        ->group('NFR-021');

    arch("NFR-021 {$module}: models extend Eloquent, policies and queries are suffixed")
        ->expect("{$ns}\\Models")->toExtend(Model::class)
        ->and("{$ns}\\Policies")->toHaveSuffix('Policy')
        ->and("{$ns}\\Queries")->toHaveSuffix('Query')
        ->group('NFR-021');
}

// Seeders and factories are data scripts outside the application (S1: IdentitySeeder, UserFactory).
arch('NFR-021 the DB facade is used only in Actions, Queries, Support, seeders and factories')
    ->expect('Illuminate\Support\Facades\DB')
    ->toOnlyBeUsedIn([...s0AllOf('Actions'), ...s0AllOf('Queries'), 'App\Support', 'Database\Seeders', 'Database\Factories'])
    ->group('NFR-021');

arch('NFR-021 no debug helpers in application code')
    ->expect(['dd', 'dump', 'ddd', 'ray', 'var_dump', 'print_r', 'var_export', 'die', 'exit'])
    ->not->toBeUsed()
    ->group('NFR-021');

arch('NFR-021 env() is read only in config files')
    ->expect('env')
    ->not->toBeUsedIn('App')
    ->group('NFR-021');

/** Audience prefixes from the contract path scopes; Public = unauthenticated reads (owner decision Q1). */
it('NFR-021 every resource is audience-specific (<Audience><Noun>Resource)', function () {
    $files = glob(dirname(__DIR__, 2).'/app/Modules/*/Http/Resources/*.php') ?: [];
    $bad = array_filter($files, fn (string $f) => ! preg_match(
        '/^(Citizen|Operations|Field|Admin|Public)[A-Z]\w*Resource$/',
        basename($f, '.php'),
    ));

    expect(array_map('basename', $bad))->toBe([]);
})->group('NFR-021');

it('NFR-021 no model is unguarded', function () {
    $files = array_merge(
        glob(dirname(__DIR__, 2).'/app/Modules/*/Models/*.php') ?: [],
        glob(dirname(__DIR__, 2).'/app/Support/**/*.php') ?: [],
    );
    $bad = array_filter($files, fn (string $f) => preg_match(
        '/\$guarded\s*=\s*\[\s*\]|::unguard(ed)?\s*\(/',
        (string) file_get_contents($f),
    ) === 1);

    expect(array_map('basename', $bad))->toBe([]);
})->group('NFR-021');

it('NFR-021 every module has routes.php and a registered service provider', function () {
    $providers = require dirname(__DIR__, 2).'/bootstrap/providers.php';

    foreach (S0_MODULES as $module) {
        $dir = dirname(__DIR__, 2)."/app/Modules/{$module}";
        expect("{$dir}/routes.php")->toBeFile()
            ->and("{$dir}/{$module}ServiceProvider.php")->toBeFile()
            ->and($providers)->toContain("App\\Modules\\{$module}\\{$module}ServiceProvider");
    }
})->group('NFR-021');
