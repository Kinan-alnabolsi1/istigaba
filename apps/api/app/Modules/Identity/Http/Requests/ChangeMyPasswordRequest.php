<?php

namespace App\Modules\Identity\Http\Requests;

use App\Support\Http\RejectsUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

/** changeMyPassword (D-38, D-06). */
final class ChangeMyPasswordRequest extends FormRequest
{
    use RejectsUnknownFields;

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8'],
        ];
    }
}
