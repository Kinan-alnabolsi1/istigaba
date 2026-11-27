<?php

namespace App\Modules\Identity\Http\Controllers;

use App\Modules\Identity\Actions\LoginAction;
use App\Modules\Identity\Actions\LogoutAction;
use App\Modules\Identity\Actions\RefreshTokenAction;
use App\Modules\Identity\Actions\RegisterCitizenAction;
use App\Modules\Identity\DTOs\RegisterCitizenData;
use App\Modules\Identity\Http\Requests\LoginRequest;
use App\Modules\Identity\Http\Requests\LogoutRequest;
use App\Modules\Identity\Http\Requests\RefreshTokenRequest;
use App\Modules\Identity\Http\Requests\RegisterCitizenRequest;
use App\Modules\Identity\Http\Resources\PublicCurrentUserResource;
use App\Modules\Identity\Http\Resources\PublicTokenPairResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/** Authentication tag: registerCitizen, login, refreshToken, logout (FR-001..FR-003). */
final class AuthController
{
    use ResolvesCaller;

    public function register(RegisterCitizenRequest $request, RegisterCitizenAction $action): JsonResponse
    {
        $user = $action->handle(new RegisterCitizenData(
            fullName: $request->string('full_name')->toString(),
            email: $request->string('email')->toString(),
            phone: $request->string('phone')->toString(),
            password: $request->string('password')->toString(),
        ));

        return (new PublicCurrentUserResource($user))->response()->setStatusCode(201);
    }

    public function login(LoginRequest $request, LoginAction $action): PublicTokenPairResource
    {
        return new PublicTokenPairResource($action->handle(
            $request->string('email')->toString(),
            $request->string('password')->toString(),
            $request->ip(),
        ));
    }

    public function refresh(RefreshTokenRequest $request, RefreshTokenAction $action): PublicTokenPairResource
    {
        return new PublicTokenPairResource($action->handle($request->string('refresh_token')->toString()));
    }

    public function logout(LogoutRequest $request, LogoutAction $action): Response
    {
        $action->handle(
            $this->callerId($request),
            $request->string('refresh_token')->toString(),
            (string) $request->bearerToken(),
        );

        return response()->noContent();
    }
}
