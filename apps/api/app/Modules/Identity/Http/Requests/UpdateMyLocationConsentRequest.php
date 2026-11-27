<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** updateMyLocationConsent (FR-027, D-15). */
final class UpdateMyLocationConsentRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'location_consent' => ['required', 'boolean'],
        ];
    }
}
