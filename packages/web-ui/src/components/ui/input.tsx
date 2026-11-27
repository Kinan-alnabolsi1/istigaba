// shadcn/ui Input (new-york-v4) with semantic tokens only. Invalid state uses border + ring and is
// always paired with a text error (FormField), never colour alone.
import type * as React from 'react';
import { cn } from '../../lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-input-m border border-input bg-card px-3 py-2 text-base text-foreground outline-none transition-[color,box-shadow] placeholder:text-text-placeholder',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-text-disabled',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
