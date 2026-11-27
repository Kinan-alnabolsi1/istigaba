<?php

// English API error messages. Keys are the contract error codes and must match lang/ar/errors.php.
return [
    'malformed_request' => 'The request could not be understood.',
    'unauthenticated' => 'Your session has ended. Please sign in again.',
    'forbidden' => 'You do not have permission to do this.',
    'not_found' => 'The requested item was not found.',
    'invalid_state_transition' => 'This action is not allowed in the current state.',
    'validation_failed' => 'Please check the highlighted fields.',
    'rate_limited' => 'Too many requests. Please try again shortly.',
    'internal_error' => 'Something went wrong. Please try again later.',
    'ai_component_unavailable' => 'The assistant is unavailable right now. You can submit a manual report.',
    'invalid_credentials' => 'The email or password is incorrect.',
    'account_locked' => 'Too many failed sign-in attempts. Please try again later.',
    'account_deactivated' => 'This account is deactivated. Please contact the system administrator.',
    'email_taken' => 'This email is already registered.',
    'phone_taken' => 'This phone number is already registered.',
    'invalid_current_password' => 'The current password is incorrect.',
    'location_consent_required' => 'Please allow location sharing first.',
];
