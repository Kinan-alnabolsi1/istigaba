// Accessible form fields: visible label, aria-invalid, and aria-describedby pointing at the hint and
// the error text. No strings here: labels and messages come from the caller (packages/i18n).
import { forwardRef, useId, useState, type ComponentProps } from 'react';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface FieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  const value = ids.filter(Boolean).join(' ');
  return value === '' ? undefined : value;
}

function FieldMessages({
  hintId,
  hint,
  errorId,
  error,
}: {
  hintId: string;
  hint?: string | undefined;
  errorId: string;
  error?: string | undefined;
}) {
  return (
    <>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-bold text-danger-text">
          {error}
        </p>
      ) : null}
    </>
  );
}

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, className, ...input },
  ref,
) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && hintId, error && errorId)}
        {...input}
      />
      <FieldMessages hintId={hintId} hint={hint} errorId={errorId} error={error} />
    </div>
  );
});

interface PasswordFieldProps extends Omit<FieldProps, 'type'> {
  showLabel: string;
  hideLabel: string;
}

/** Password input with a text-labelled visibility toggle (no icon-only control). */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, hint, showLabel, hideLabel, className, ...input }, ref) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const [visible, setVisible] = useState(false);
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-2">
          <Input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(hint && hintId, error && errorId)}
            {...input}
          />
          <button
            type="button"
            aria-pressed={visible}
            aria-controls={id}
            onClick={() => setVisible((v) => !v)}
            className="h-10 shrink-0 rounded-input-m border border-input bg-card px-3 text-sm font-bold text-primary hover:bg-state-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:text-foreground"
          >
            {visible ? hideLabel : showLabel}
          </button>
        </div>
        <FieldMessages hintId={hintId} hint={hint} errorId={errorId} error={error} />
      </div>
    );
  },
);
