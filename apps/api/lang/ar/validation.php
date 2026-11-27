<?php

// Arabic validation messages (default locale). Only the rules the API uses; English comes from the
// framework, merged with lang/en/validation.php.
return [
    'array' => 'يجب أن يكون الحقل :attribute قائمة.',
    'between' => [
        'numeric' => 'يجب أن تكون قيمة :attribute بين :min و :max.',
        'string' => 'يجب أن يكون طول :attribute بين :min و :max حرفاً.',
    ],
    'boolean' => 'يجب أن تكون قيمة :attribute صحيحة أو خاطئة.',
    'distinct' => 'الحقل :attribute يحتوي على قيمة مكررة.',
    'email' => 'يجب أن يكون :attribute عنوان بريد إلكتروني صحيحاً.',
    'exists' => 'القيمة المحددة في :attribute غير موجودة.',
    'integer' => 'يجب أن يكون :attribute عدداً صحيحاً.',
    'max' => [
        'numeric' => 'يجب ألا تزيد قيمة :attribute عن :max.',
        'string' => 'يجب ألا يزيد طول :attribute عن :max حرفاً.',
        'array' => 'يجب ألا تحتوي :attribute على أكثر من :max عناصر.',
    ],
    'min' => [
        'numeric' => 'يجب ألا تقل قيمة :attribute عن :min.',
        'string' => 'يجب ألا يقل طول :attribute عن :min أحرف.',
        'array' => 'يجب أن تحتوي :attribute على :min عناصر على الأقل.',
    ],
    'numeric' => 'يجب أن يكون :attribute رقماً.',
    'present' => 'يجب إرسال الحقل :attribute.',
    'regex' => 'صيغة :attribute غير صحيحة.',
    'required' => 'الحقل :attribute مطلوب.',
    'string' => 'يجب أن يكون :attribute نصاً.',
    'unknown_field' => 'الحقل :attribute غير مسموح به.',
    'empty_body' => 'يجب إرسال حقل واحد على الأقل.',

    'attributes' => [
        'full_name' => 'الاسم الكامل',
        'email' => 'البريد الإلكتروني',
        'phone' => 'رقم الهاتف',
        'password' => 'كلمة المرور',
        'current_password' => 'كلمة المرور الحالية',
        'new_password' => 'كلمة المرور الجديدة',
        'refresh_token' => 'رمز التحديث',
        'location_consent' => 'إذن الموقع',
        'location' => 'الموقع',
        'location.latitude' => 'خط العرض',
        'location.longitude' => 'خط الطول',
        'permission_ids' => 'الصلاحيات',
        'permission_ids.*' => 'الصلاحية',
    ],
];
