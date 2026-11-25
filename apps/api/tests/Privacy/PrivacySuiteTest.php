<?php

/*
| H1 privacy suite. Real cases start in S3 (first anonymous manual report) and are completed in S4/S6/S9/S11.
| This placeholder keeps the suite wired into `composer test` and CI from S0 on.
*/

it('S0 privacy suite is wired into the test run', function () {
    expect(is_dir(__DIR__))->toBeTrue();
})->group('S0');
