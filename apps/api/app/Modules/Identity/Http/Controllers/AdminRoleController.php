<?php

namespace App\Modules\Identity\Http\Controllers;

use App\Modules\Identity\Actions\ListPermissionsAction;
use App\Modules\Identity\Actions\ListRolesAction;
use App\Modules\Identity\Actions\ReplaceRolePermissionsAction;
use App\Modules\Identity\Http\Requests\ReplaceRolePermissionsRequest;
use App\Modules\Identity\Http\Resources\AdminPermissionResource;
use App\Modules\Identity\Http\Resources\AdminRoleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Roles and Permissions tag (FR-004), System Administrator with `role.manage`. */
final class AdminRoleController
{
    use ResolvesCaller;

    public function roles(Request $request, ListRolesAction $action): JsonResponse
    {
        return new JsonResponse(['data' => AdminRoleResource::collection($action->handle())->resolve($request)]);
    }

    public function permissions(Request $request, ListPermissionsAction $action): JsonResponse
    {
        return new JsonResponse(['data' => AdminPermissionResource::collection($action->handle())->resolve($request)]);
    }

    public function replacePermissions(ReplaceRolePermissionsRequest $request, int $roleId, ReplaceRolePermissionsAction $action): AdminRoleResource
    {
        return new AdminRoleResource($action->handle(
            $roleId,
            $request->permissionIds(),
            $this->callerId($request),
            $this->context($request),
        ));
    }
}
