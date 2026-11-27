<?php

namespace Database\Factories;

use App\Modules\Identity\Models\Role;
use App\Modules\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Users for tests and the dev demo seeder. Roles must be seeded first (IdentitySeeder).
 *
 * @extends Factory<User>
 */
final class UserFactory extends Factory
{
    protected $model = User::class;

    /** Password every factory user gets unless overridden. */
    public const PASSWORD = 'password-123';

    private static ?string $hash = null;

    public function definition(): array
    {
        self::$hash ??= Hash::make(self::PASSWORD);

        return [
            'role_id' => fn () => self::roleId(Role::CITIZEN),
            'field_unit_id' => null,
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+9639'.fake()->unique()->numerify('########'),
            'password_hash' => self::$hash,
            'is_active' => true,
            'location_consent' => false,
        ];
    }

    public function citizen(): self
    {
        return $this->state(fn () => ['role_id' => self::roleId(Role::CITIZEN)]);
    }

    public function dispatcher(): self
    {
        return $this->state(fn () => ['role_id' => self::roleId(Role::DISPATCHER)]);
    }

    public function admin(): self
    {
        return $this->state(fn () => ['role_id' => self::roleId(Role::SYSTEM_ADMINISTRATOR)]);
    }

    public function fieldUnitRepresentative(): self
    {
        return $this->state(fn () => [
            'role_id' => self::roleId(Role::FIELD_UNIT_REPRESENTATIVE),
            'field_unit_id' => fn () => DB::table('field_units')->insertGetId([
                'name' => 'Unit '.fake()->unique()->numberBetween(1, 99999),
                'unit_type' => 'إسعاف',
            ]),
        ]);
    }

    public function withRole(string $role): self
    {
        return match ($role) {
            Role::FIELD_UNIT_REPRESENTATIVE => $this->fieldUnitRepresentative(),
            default => $this->state(fn () => ['role_id' => self::roleId($role)]),
        };
    }

    public function inactive(): self
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    private static function roleId(string $name): int
    {
        $id = DB::table('roles')->where('name', $name)->value('id');

        if (! is_numeric($id)) {
            throw new \RuntimeException("Role [{$name}] is not seeded: run IdentitySeeder first.");
        }

        return (int) $id;
    }
}
