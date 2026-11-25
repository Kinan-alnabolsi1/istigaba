<?php

use Illuminate\Http\JsonResponse;
use Osteel\OpenApi\Testing\ValidatorBuilder;

/*
| S0 spike (plan §8.5, risk R3): can the PHP contract validator load the OpenAPI 3.1 document
| and validate a response against it? Contract tests from S1 on depend on this.
*/

function s0ContractPath(): string
{
    return dirname(__DIR__, 4).'/docs/api/openapi.yaml';
}

it('S0 contract validator loads the 3.1 document and accepts a valid error body', function () {
    $validator = ValidatorBuilder::fromYamlFile(s0ContractPath())->getValidator();

    $response = new JsonResponse(
        ['code' => 'unauthenticated', 'message' => 'Session expired', 'request_id' => 'req-1'],
        401,
    );

    expect($validator->validate($response, '/me', 'get'))->toBeTrue();
})->group('S0');

it('S0 contract validator rejects a body that violates the schema', function () {
    $validator = ValidatorBuilder::fromYamlFile(s0ContractPath())->getValidator();

    $response = new JsonResponse(['message' => 'missing code'], 401);

    expect(fn () => $validator->validate($response, '/me', 'get'))->toThrow(Exception::class);
})->group('S0');
