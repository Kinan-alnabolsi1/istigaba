<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

/*
| S0 verification of matanyadaev/laravel-eloquent-spatial on PostgreSQL 18 + PostGIS 3.7 (plan §2.6, risk R2).
| Upstream tests only PostGIS 3.4–3.6. Uses a test-only model on field_units so no domain model is created early.
*/

uses(RefreshDatabase::class);

/**
 * @property int $id
 * @property Point|null $location
 */
final class S0FieldUnitSpatialProbe extends Model
{
    use HasSpatial;

    protected $table = 'field_units';

    public $timestamps = false;

    protected $fillable = ['name', 'unit_type', 'location'];

    protected function casts(): array
    {
        return ['location' => Point::class];
    }
}

// Damascus (Umayyad Square) and a point ~1.1 km away; Aleppo ~300 km away.
const S0_DAMASCUS = [33.5131, 36.2765];
const S0_NEARBY = [33.5231, 36.2765];
const S0_ALEPPO = [36.2021, 37.1343];

function s0Unit(string $name, array $latLng): S0FieldUnitSpatialProbe
{
    return S0FieldUnitSpatialProbe::query()->create([
        'name' => $name,
        'unit_type' => 'إسعاف',
        'location' => new Point($latLng[0], $latLng[1], 4326),
    ]);
}

it('S0 laravel-eloquent-spatial writes and reads a Point on a geography(Point,4326) column', function () {
    $unit = s0Unit('Damascus', S0_DAMASCUS);

    $fresh = S0FieldUnitSpatialProbe::query()->findOrFail($unit->id);

    expect($fresh->location)->toBeInstanceOf(Point::class)
        ->and($fresh->location->latitude)->toEqualWithDelta(S0_DAMASCUS[0], 1e-9)
        ->and($fresh->location->longitude)->toEqualWithDelta(S0_DAMASCUS[1], 1e-9)
        ->and($fresh->location->srid)->toBe(4326)
        ->and(DB::scalar('SELECT ST_SRID(location::geometry) FROM field_units WHERE id = ?', [$unit->id]))->toBe(4326);
})->group('S0');

it('S0 laravel-eloquent-spatial distance queries work on PostGIS 3.7', function () {
    s0Unit('Damascus', S0_DAMASCUS);
    s0Unit('Nearby', S0_NEARBY);
    s0Unit('Aleppo', S0_ALEPPO);
    $origin = new Point(S0_DAMASCUS[0], S0_DAMASCUS[1], 4326);

    $within5km = S0FieldUnitSpatialProbe::query()
        ->whereDistanceSphere('location', $origin, '<', 5000)
        ->orderBy('name')
        ->pluck('name')
        ->all();

    expect($within5km)->toBe(['Damascus', 'Nearby']);
})->group('S0');

it('S0 raw ST_DWithin and ST_Distance on geography return metres', function () {
    s0Unit('Damascus', S0_DAMASCUS);
    s0Unit('Nearby', S0_NEARBY);
    s0Unit('Aleppo', S0_ALEPPO);

    $rows = DB::select(
        'SELECT name, ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) AS metres
           FROM field_units
          WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)
          ORDER BY metres',
        [S0_DAMASCUS[1], S0_DAMASCUS[0], S0_DAMASCUS[1], S0_DAMASCUS[0], 50000],
    );

    expect(array_column($rows, 'name'))->toBe(['Damascus', 'Nearby'])
        ->and((float) $rows[1]->metres)->toBeGreaterThan(1000)->toBeLessThan(1200);
})->group('S0');
