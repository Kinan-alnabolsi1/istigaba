<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** login (FR-002). */
final class LoginRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'password' => ['required', 'string'],
        ];
    }
}
