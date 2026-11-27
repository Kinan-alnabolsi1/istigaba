<?php

use App\Modules\Identity\Models\Role;
use App\Modules\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use MatanYadaev\EloquentSpatial\Objects\Point;

uses(RefreshDatabase::class);

beforeEach(fn () => seedIdentity());

$damascus = ['location' => ['latitude' => 33.5138, 'longitude' => 36.2765]];

it('FR-027 D-15 revoking consent clears the stored location and its timestamp', function () {
    $user = userWithRole(Role::CITIZEN, ['location_consent' => true]);
    $user->forceFill(['last_known_location' => new Point(33.5, 36.2, 4326), 'location_updated_at' => now()])->save();

    $this->putJson('/api/v1/me/location-consent', ['location_consent' => false], bearer($user))
        ->assertNoContent();

    $row = DB::table('users')->where('id', $user->id)->first();
    expect($row->location_consent)->toBeFalse()
        ->and($row->last_known_location)->toBeNull()
        ->and($row->location_updated_at)->toBeNull();
})->group('FR-027', 'NFR-012');

it('FR-027 granting consent sets only the flag', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->putJson('/api/v1/me/location-consent', ['location_consent' => true], bearer($user))->assertNoContent();

    $row = DB::table('users')->where('id', $user->id)->first();
    expect($row->location_consent)->toBeTrue()->and($row->last_known_location)->toBeNull();
    $this->getJson('/api/v1/me', bearer($user))->assertJson(['location_consent' => true]);
})->group('FR-027');

it('FR-027 consent must be a boolean', function () {
    $user = userWithRole(Role::CITIZEN);

    $this->putJson('/api/v1/me/location-consent', ['location_consent' => 'yes'], bearer($user))
        ->assertUnprocessable()->assertJsonValidationErrors(['location_consent'])->assertMatchesContract();
})->group('FR-027');

it('FR-027 without consent a location update is refused with 409 location_consent_required', function () use ($damascus) {
    $user = userWithRole(Role::CITIZEN);

    $this->putJson('/api/v1/me/location', $damascus, bearer($user))
        ->assertStatus(409)
        ->assertJson(['code' => 'location_consent_required'])
        ->assertMatchesContract();

    expect(DB::table('users')->where('id', $user->id)->value('last_known_location'))->toBeNull();
})->group('FR-027', 'FR-012');

it('FR-027 with consent the location and its timestamp are stored', function () use ($damascus) {
    $user = userWithRole(Role::CITIZEN, ['location_consent' => true]);

    $this->putJson('/api/v1/me/location', $damascus, bearer($user))->assertNoContent();

    $fresh = User::query()->findOrFail($user->id);
    expect($fresh->last_known_location)->toBeInstanceOf(Point::class)
        ->and($fresh->last_known_location->latitude)->toEqualWithDelta(33.5138, 0.000001)
        ->and($fresh->last_known_location->longitude)->toEqualWithDelta(36.2765, 0.000001)
        ->and($fresh->location_updated_at)->not->toBeNull();

    // Write-only: GET /me exposes the timestamp, never the coordinates.
    $body = $this->getJson('/api/v1/me', bearer($user))->assertOk()->json();
    expect($body['location_updated_at'])->not->toBeNull()
        ->and(json_encode($body))->not->toContain('33.5138');
})->group('FR-027', 'FR-012', 'NFR-016');

it('FR-027 validates coordinates and rejects extra fields', function (array $body, string $field) {
    $user = userWithRole(Role::CITIZEN, ['location_consent' => true]);

    $this->putJson('/api/v1/me/location', $body, bearer($user))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field])
        ->assertMatchesContract();
})->with([
    'missing' => [[], 'location'],
    'latitude out of range' => [['location' => ['latitude' => 91, 'longitude' => 36]], 'location.latitude'],
    'longitude out of range' => [['location' => ['latitude' => 33, 'longitude' => -181]], 'location.longitude'],
    'extra field' => [['location' => ['latitude' => 33, 'longitude' => 36], 'accuracy' => 5], 'accuracy'],
])->group('FR-027');

it('NFR-011 location updates are limited to 10 per minute per user', function () use ($damascus) {
    $user = userWithRole(Role::CITIZEN, ['location_consent' => true]);
    $headers = bearer($user);

    foreach (range(1, 10) as $i) {
        $this->putJson('/api/v1/me/location', $damascus, $headers)->assertNoContent();
    }

    // The contract documents no 429 for updateMyLocation (plan Q8), so only the envelope is checked.
    $this->putJson('/api/v1/me/location', $damascus, $headers)
        ->assertStatus(429)
        ->assertHeader('Retry-After')
        ->assertJson(['code' => 'rate_limited']);
})->group('NFR-011');
