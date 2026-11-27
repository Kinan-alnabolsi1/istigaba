<?php

namespace App\Modules\Identity\Http\Resources;

use App\Modules\Identity\DTOs\TokenPairData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Contract `TokenPair` (login, refresh, password change).
 *
 * @property TokenPairData $resource
 */
final class PublicTokenPairResource extends JsonResource
{
    public function __construct(TokenPairData $resource)
    {
        parent::__construct($resource);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'access_token' => $this->resource->accessToken,
            'refresh_token' => $this->resource->refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => $this->resource->expiresIn,
        ];
    }
}
