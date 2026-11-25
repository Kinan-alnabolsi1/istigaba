// Arabic (default, RTL). Keys must match en.ts exactly (enforced by test).
export const ar = {
  common: {
    appName: 'استجابة',
    loading: 'جارٍ التحميل…',
    retry: 'إعادة المحاولة',
  },
  apps: {
    ops: 'غرفة العمليات',
    admin: 'لوحة إدارة النظام',
    citizen: 'تطبيق المواطن',
    field: 'تطبيق الوحدة الميدانية',
  },
  theme: {
    label: 'المظهر',
    system: 'حسب النظام',
    light: 'فاتح',
    dark: 'داكن',
  },
  language: {
    label: 'اللغة',
    ar: 'العربية',
    en: 'English',
  },
  errors: {
    malformed_request: 'تعذّر فهم الطلب.',
    unauthenticated: 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.',
    forbidden: 'لا تملك صلاحية تنفيذ هذا الإجراء.',
    not_found: 'العنصر المطلوب غير موجود.',
    invalid_state_transition: 'لا يمكن تنفيذ هذا الإجراء في الحالة الحالية.',
    validation_failed: 'يرجى مراجعة الحقول المدخلة.',
    rate_limited: 'طلبات كثيرة. يرجى المحاولة بعد قليل.',
    internal_error: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.',
    ai_component_unavailable: 'المساعد الذكي غير متاح حالياً. يمكنك تقديم بلاغ يدوي.',
    network_error: 'لا يوجد اتصال بالشبكة.',
    unknown_error: 'حدث خطأ. يرجى المحاولة مجدداً.',
  },
} as const;
