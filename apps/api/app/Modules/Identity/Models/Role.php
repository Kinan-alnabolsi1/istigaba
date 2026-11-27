<?php

namespace App\Modules\Identity\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * One of the four fixed SRS roles (DBML `roles`).
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 */
final class Role extends Model
{
    public const CITIZEN = 'Citizen';

    public const DISPATCHER = 'Dispatcher';

    public const FIELD_UNIT_REPRESENTATIVE = 'Field Unit Representative';

    public const SYSTEM_ADMINISTRATOR = 'System Administrator';

    public const ALL = [
        self::CITIZEN,
        self::DISPATCHER,
        self::FIELD_UNIT_REPRESENTATIVE,
        self::SYSTEM_ADMINISTRATOR,
    ];

    public $timestamps = false;

    protected $table = 'roles';

    protected $fillable = ['name', 'description'];

    /** @return BelongsToMany<Permission, $this> */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }
}
