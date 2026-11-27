<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\PhoneRule;
use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** updateMyProfile (D-38). `minProperties: 1`; role, unit and activation are not accepted. */
final class UpdateMyProfileRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => ['sometimes', 'required', 'string', 'email:rfc', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:'.PhoneRule::E164],
        ];
    }

    protected function requiresAtLeastOneField(): bool
    {
        return true;
    }

    /** @return array{full_name?: string, email?: string, phone?: string|null} */
    public function changes(): array
    {
        /** @var array{full_name?: string, email?: string, phone?: string|null} */
        return $this->safe()->only(['full_name', 'email', 'phone']);
    }
}
