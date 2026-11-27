<?php

use App\Modules\Identity\Models\User;
use Database\Factories\UserFactory;
use Database\Seeders\IdentitySeeder;
use Illuminate\Support\Facades\Artisan;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

/*
| Every test names its FR/NFR (or S0) ID in the test name and in ->group() (CLAUDE.md §3.1).
| Architecture tests run without the application.
*/
pest()->extend(TestCase::class)->in('Feature', 'Database', 'Contract', 'Privacy', 'Unit');

/** Roles, D-34 permissions and the role map (FR-004). */
function seedIdentity(): void
{
    Artisan::call('db:seed', ['--class' => IdentitySeeder::class, '--force' => true]);
}

/** @param array<string, mixed> $attributes */
function userWithRole(string $role, array $attributes = []): User
{
    return UserFactory::new()->withRole($role)->create($attributes);
}

/** A real access token for the user, as login would issue it. */
function accessTokenFor(User $user): string
{
    return JWTAuth::fromUser($user);
}

/** @return array<string, string> */
function bearer(User $user): array
{
    return ['Authorization' => 'Bearer '.accessTokenFor($user)];
}
