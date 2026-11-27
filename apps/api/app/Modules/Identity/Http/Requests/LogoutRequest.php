<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** logout (FR-003). */
final class LogoutRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'refresh_token' => ['required', 'string', 'max:512'],
        ];
    }
}
