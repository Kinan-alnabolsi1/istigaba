// Callout (shadcn/ui Alert idea) on the callout tokens. The message text carries the meaning; the
// tone is reinforced by a border-start strip, never by colour alone.
import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva('rounded-md border border-s-4 px-4 py-3 text-sm', {
  variants: {
    tone: {
      danger: 'border-callout-danger-border bg-callout-danger-bg text-callout-danger-fg',
      info: 'border-callout-info-border bg-callout-info-bg text-callout-info-fg',
      success: 'border-callout-success-border bg-callout-success-bg text-callout-success-fg',
      warning: 'border-callout-warning-border bg-callout-warning-bg text-callout-warning-fg',
    },
  },
  defaultVariants: { tone: 'info' },
});

function Alert({
  className,
  tone,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" className={cn(alertVariants({ tone }), className)} {...props} />;
}

export { Alert, alertVariants };
