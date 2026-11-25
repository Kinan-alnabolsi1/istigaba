import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, buttonVariants } from '../src';

// Raw palette utilities or literal colours would bypass the Light/Dark tokens (CLAUDE.md §9).
const HARD_CODED =
  /\b(?:bg|text|border|ring)-(?:white|black|(?:red|blue|green|gray|slate|zinc|neutral)-\d{2,3})\b|#[0-9a-f]{3,8}\b/i;
const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

describe('NFR-022 web-ui Button', () => {
  it('NFR-022 renders a native button with the default token classes (DESIGN_TOKENS §8.1)', () => {
    render(<Button>حفظ</Button>);
    const button = screen.getByRole('button', { name: 'حفظ' });
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('hover:bg-primary-hover');
    expect(button.className).toContain('active:bg-primary-pressed');
    expect(button.className).toContain('h-10');
    expect(button.className).toContain('font-bold');
  });

  it('NFR-022 destructive uses destructive tokens, not literal white', () => {
    const cls = buttonVariants({ variant: 'destructive' });
    expect(cls).toContain('text-destructive-foreground');
    expect(cls).toContain('hover:bg-destructive-hover');
  });

  it.each(variants)('NFR-022 %s variant has no hard-coded colours', (variant) => {
    expect(buttonVariants({ variant })).not.toMatch(HARD_CODED);
  });

  it('NFR-022 uses logical spacing only (RTL-safe)', () => {
    for (const variant of variants) {
      expect(buttonVariants({ variant })).not.toMatch(/\b(?:ml|mr|pl|pr|left|right)-/);
    }
  });
});
