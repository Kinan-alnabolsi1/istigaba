<?php

namespace App\Modules\Identity\Models;

use Carbon\CarbonImmutable;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasVersion4Uuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

/**
 * A platform user of any role (DBML `users`). Never serialised directly: every payload is built
 * by an audience-specific Resource from a DTO.
 *
 * @property string $id
 * @property int $role_id
 * @property int|null $field_unit_id
 * @property string $full_name
 * @property string $email
 * @property string|null $phone
 * @property string $password_hash
 * @property bool $is_active
 * @property Point|null $last_known_location
 * @property CarbonImmutable|null $location_updated_at
 * @property bool $location_consent
 * @property CarbonImmutable $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Role $role
 */
final class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasSpatial;
    use HasVersion4Uuids;

    protected $table = 'users';

    protected $fillable = [
        'role_id',
        'field_unit_id',
        'full_name',
        'email',
        'phone',
        'password_hash',
        'is_active',
        'last_known_location',
        'location_updated_at',
        'location_consent',
    ];

    protected $hidden = ['password_hash', 'last_known_location'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'location_consent' => 'boolean',
            'location_updated_at' => 'immutable_datetime',
            'last_known_location' => Point::class,
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    /** The DBML column is `password_hash`, not Laravel's default `password`. */
    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    /** @return BelongsTo<Role, $this> */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /** @return HasMany<RefreshToken, $this> */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * No custom claims: the access token carries no identity data beyond `sub` (H6).
     *
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }
}
