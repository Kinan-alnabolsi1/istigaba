<?php

use Tests\TestCase;

/*
| Every test names its FR/NFR (or S0) ID in the test name and in ->group() (CLAUDE.md §3.1).
| Architecture tests run without the application.
*/
pest()->extend(TestCase::class)->in('Feature', 'Database', 'Contract', 'Privacy', 'Unit');
