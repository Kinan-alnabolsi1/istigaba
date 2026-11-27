import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, Card, CardTitle, PasswordField, TextField, alertVariants } from '../src';

const HARD_CODED =
  /\b(?:bg|text|border|ring)-(?:white|black|(?:red|blue|green|gray|slate|zinc|neutral)-\d{2,3})\b|#[0-9a-f]{3,8}\b/i;
// Whole physical-direction utilities (after any `variant:` prefixes are stripped).
const PHYSICAL =
  /^(?:-?(?:ml|mr|pl|pr|left|right)-\S+|border-[lr](?:-\S+)?|rounded-[lr](?:-\S+)?|text-(?:left|right))$/;

function allClasses(container: HTMLElement): string {
  return [container, ...Array.from(container.querySelectorAll('*'))]
    .map((el) => el.getAttribute('class') ?? '')
    .join(' ');
}

describe('NFR-022 web-ui S1 primitives', () => {
  it('NFR-022 fields, card and callouts use semantic tokens and logical properties only', () => {
    const { container } = render(
      <Card>
        <CardTitle>t</CardTitle>
        <TextField label="a" error="e" hint="h" />
        <PasswordField label="b" showLabel="s" hideLabel="h" error="e" />
        <Alert tone="danger">x</Alert>
      </Card>,
    );
    const classes = allClasses(container);

    expect(classes).not.toMatch(HARD_CODED);
    const physical = classes
      .split(/\s+/)
      .filter((c) => PHYSICAL.test(c.slice(c.lastIndexOf(':') + 1)));
    expect(physical).toEqual([]);
    // Sanity: the check would catch a physical utility.
    expect(PHYSICAL.test('ml-4')).toBe(true);
    expect(PHYSICAL.test('text-primary')).toBe(false);
    for (const tone of ['danger', 'info', 'success', 'warning'] as const) {
      expect(alertVariants({ tone })).toContain(`bg-callout-${tone}-bg`);
      // Tone is reinforced by a start-side strip (logical), not by colour alone.
      expect(alertVariants({ tone })).toContain('border-s-4');
    }
  });

  it('NFR-022 a field links its label, hint and error for assistive technology', () => {
    const { getByLabelText, getByText } = render(
      <TextField label="Email" hint="Hint" error="Bad" />,
    );
    const input = getByLabelText('Email');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toContain(getByText('Hint').id);
    expect(ids).toContain(getByText('Bad').id);
  });

  it('NFR-022 a valid field is not marked invalid', () => {
    const { getByLabelText } = render(<TextField label="Email" />);

    expect(getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
    expect(getByLabelText('Email')).not.toHaveAttribute('aria-describedby');
  });
});
