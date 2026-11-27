<?php

namespace App\Modules\Identity\Http\Controllers;

use App\Modules\Identity\Actions\ChangeMyPasswordAction;
use App\Modules\Identity\Actions\GetCurrentUserAction;
use App\Modules\Identity\Actions\UpdateMyLocationAction;
use App\Modules\Identity\Actions\UpdateMyLocationConsentAction;
use App\Modules\Identity\Actions\UpdateMyProfileAction;
use App\Modules\Identity\DTOs\ProfileUpdateData;
use App\Modules\Identity\Http\Requests\ChangeMyPasswordRequest;
use App\Modules\Identity\Http\Requests\UpdateMyLocationConsentRequest;
use App\Modules\Identity\Http\Requests\UpdateMyLocationRequest;
use App\Modules\Identity\Http\Requests\UpdateMyProfileRequest;
use App\Modules\Identity\Http\Resources\PublicCurrentUserResource;
use App\Modules\Identity\Http\Resources\PublicTokenPairResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Current User tag: own profile, password, location consent and location (own record only). */
final class MeController
{
    use ResolvesCaller;

    public function show(Request $request, GetCurrentUserAction $action): PublicCurrentUserResource
    {
        return new PublicCurrentUserResource($action->handle($this->callerId($request)));
    }

    public function update(UpdateMyProfileRequest $request, UpdateMyProfileAction $action): PublicCurrentUserResource
    {
        return new PublicCurrentUserResource($action->handle(
            $this->callerId($request),
            new ProfileUpdateData($request->changes()),
            $this->context($request),
        ));
    }

    public function changePassword(ChangeMyPasswordRequest $request, ChangeMyPasswordAction $action): PublicTokenPairResource
    {
        return new PublicTokenPairResource($action->handle(
            $this->callerId($request),
            $request->string('current_password')->toString(),
            $request->string('new_password')->toString(),
            $this->context($request),
        ));
    }

    public function updateLocationConsent(UpdateMyLocationConsentRequest $request, UpdateMyLocationConsentAction $action): Response
    {
        $action->handle($this->callerId($request), $request->boolean('location_consent'));

        return response()->noContent();
    }

    public function updateLocation(UpdateMyLocationRequest $request, UpdateMyLocationAction $action): Response
    {
        $action->handle(
            $this->callerId($request),
            $request->float('location.latitude'),
            $request->float('location.longitude'),
        );

        return response()->noContent();
    }
}
