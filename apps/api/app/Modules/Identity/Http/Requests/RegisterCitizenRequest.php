<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\PhoneRule;
use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** registerCitizen (FR-001). No role field: an unknown field is a 422. */
final class RegisterCitizenRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'min:1', 'max:150'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'regex:'.PhoneRule::E164],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
