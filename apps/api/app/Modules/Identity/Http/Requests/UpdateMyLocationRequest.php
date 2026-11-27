<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** updateMyLocation (FR-027). GeoPoint is additionalProperties: false. */
final class UpdateMyLocationRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'location' => ['required', 'array'],
            'location.latitude' => ['required', 'numeric', 'between:-90,90'],
            'location.longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
