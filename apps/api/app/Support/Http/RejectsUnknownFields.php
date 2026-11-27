<?php

namespace App\Support\Http;

use Illuminate\Validation\Validator;

/**
 * For FormRequests whose contract schema has `additionalProperties: false`: any body field (or
 * nested object field) without a rule is a 422 with `validation.unknown_field`. This is what stops
 * a registration body from carrying a role (FR-001) or a profile update from changing activation.
 */
trait RejectsUnknownFields
{
    /** Contract `minProperties: 1`: an empty body is rejected too. */
    protected function requiresAtLeastOneField(): bool
    {
        return false;
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $input = $this->all();
            $known = array_keys($this->rules());

            if ($this->requiresAtLeastOneField() && $input === []) {
                $validator->errors()->add('body', (string) trans('validation.empty_body'));
            }

            foreach ($this->unknownKeys($input, $known) as $key) {
                $validator->errors()->add($key, (string) trans('validation.unknown_field', ['attribute' => $key]));
            }
        }];
    }

    /**
     * @param  array<array-key, mixed>  $input
     * @param  list<string>  $known
     * @return list<string>
     */
    private function unknownKeys(array $input, array $known, string $prefix = ''): array
    {
        $unknown = [];
        foreach ($input as $key => $value) {
            $path = $prefix.$key;
            if (is_int($key)) {
                // List items (`permission_ids.*`) are validated by their own rules.
                continue;
            }
            if (! in_array($path, $known, true)) {
                $unknown[] = $path;

                continue;
            }
            if (is_array($value) && ! array_is_list($value)) {
                array_push($unknown, ...$this->unknownKeys($value, $known, $path.'.'));
            }
        }

        return $unknown;
    }
}
