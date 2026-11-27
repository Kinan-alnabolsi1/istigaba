<?php

namespace App\Modules\Identity\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A D-34 permission code (DBML `permissions`).
 *
 * @property int $id
 * @property string $code
 * @property string|null $description
 */
final class Permission extends Model
{
    public $timestamps = false;

    protected $table = 'permissions';

    protected $fillable = ['code', 'description'];
}
