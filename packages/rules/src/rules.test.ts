import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseMarkup } from '@tosynui/parser';
import { checkDocument, rules } from './index.js';

const examplesDirectory = new URL('../../../examples/', import.meta.url);

/** Parses markup for a test, failing loudly if the markup itself is broken. */
function check(markup: string) {
  const { document, diagnostics } = parseMarkup(markup);
  expect(diagnostics).toEqual([]);
  return checkDocument(document);
}

function screen(body: string): string {
  return `<screen name="test" purpose="Exercise the rules.">${body}</screen>`;
}

function codes(markup: string): string[] {
  return check(markup).findings.map((finding) => finding.code);
}

describe('checkDocument', () => {
  it.each(readdirSync(examplesDirectory).filter((file) => file.endsWith('.tosyn')))(
    '%s passes every rule',
    (file) => {
      const result = check(readFileSync(new URL(file, examplesDirectory), 'utf8'));
      expect(result).toEqual({ valid: true, findings: [] });
    },
  );

  it('reports spec errors and skips design rules', () => {
    const result = check(
      screen(
        '<section name="a"><action intent="submit" importance="primary">A</action><action intent="submit" importance="primary">B</action><button>x</button></section>',
      ),
    );
    expect(result.valid).toBe(false);
    expect(result.findings.map((finding) => [finding.source, finding.code])).toEqual([
      ['spec', 'unknown-element'],
    ]);
  });

  it('treats warnings as valid and errors as invalid', () => {
    const warning = check(
      screen(
        '<section name="a"><action intent="delete" importance="primary">Delete</action></section>',
      ),
    );
    expect(warning.valid).toBe(true);
    expect(warning.findings).toEqual([
      expect.objectContaining({ code: 'delete-not-primary', severity: 'warning' }),
    ]);

    const error = check(
      screen('<section name="a"><action intent="navigate">Go</action></section>'),
    );
    expect(error.valid).toBe(false);
  });

  it('accepts a custom rule set', () => {
    const result = checkDocument(
      parseMarkup(screen('<section name="a"><action intent="navigate">Go</action></section>'))
        .document,
      { rules: [] },
    );
    expect(result).toEqual({ valid: true, findings: [] });
  });
});

describe('rules', () => {
  it('have unique ids and complete documentation', () => {
    const ids = rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const rule of rules) {
      expect(rule.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(rule.summary.length).toBeGreaterThan(10);
      expect(rule.rationale.length).toBeGreaterThan(10);
    }
  });

  it.each([
    [
      'single-primary-action',
      '<section name="a"><heading>Form</heading><field name="x" label="X" /><action intent="submit" importance="primary">Save</action><action intent="navigate" importance="primary" target="/">Next</action></section>',
    ],
    [
      'single-featured-section',
      '<section name="a" emphasis="featured"><text>A</text></section><section name="b"><section name="c" emphasis="featured"><text>C</text></section></section>',
    ],
    ['single-heading', '<section name="a"><heading>One</heading><heading>Two</heading></section>'],
    ['heading-first', '<section name="a"><text>Intro</text><heading>Title</heading></section>'],
    ['form-needs-heading', '<section name="a"><field name="x" label="X" /></section>'],
    [
      'max-section-depth',
      '<section name="a"><section name="b"><section name="c"><section name="d"><text>Deep</text></section></section></section></section>',
    ],
    [
      'navigate-needs-target',
      '<section name="a"><action intent="navigate">Next</action></section>',
    ],
    [
      'target-requires-navigate',
      '<section name="a"><action intent="cancel" target="/home">Cancel</action></section>',
    ],
    [
      'delete-not-primary',
      '<section name="a"><action intent="delete" importance="primary">Delete</action></section>',
    ],
    ['submit-needs-field', '<section name="a"><action intent="submit">Send</action></section>'],
    [
      'concise-action-label',
      '<section name="a"><action intent="cancel">Go back to the previous page now</action></section>',
    ],
  ])('%s is reported', (rule, body) => {
    expect(codes(screen(body))).toEqual([rule]);
  });

  it('reports findings at the offending element', () => {
    const result = check(
      screen('<section name="a"><action intent="cancel" target="/x">Cancel</action></section>'),
    );
    expect(result.findings[0]).toMatchObject({
      path: '/root/children/0/children/0/attributes/target',
      message: expect.stringContaining('Cancel'),
    });
  });

  it('allows a featured section with nested sections up to the depth limit', () => {
    expect(
      codes(
        screen(
          '<section name="a" emphasis="featured"><heading>A</heading><section name="b"><section name="c"><text>Ok</text></section></section></section>',
        ),
      ),
    ).toEqual([]);
  });
});
