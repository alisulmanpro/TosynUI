import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkDocument, rules } from '@tosynui/rules';
import { catalog } from '@tosynui/spec';
import { parseMarkup } from '@tosynui/parser';
import { exampleMarkup, renderGuide } from './index.js';

const root = new URL('../../../', import.meta.url);

describe('renderGuide', () => {
  const guide = renderGuide();

  it('documents every element, attribute and rule', () => {
    for (const [name, element] of Object.entries(catalog.elements)) {
      expect(guide).toContain(`### \`<${name}>\``);
      for (const attribute of Object.keys(element.attributes)) {
        expect(guide).toContain(`- \`${attribute}\`:`);
      }
    }
    for (const rule of rules) expect(guide).toContain(`**${rule.id}**`);
  });

  it('shows allowed values and defaults', () => {
    expect(guide).toContain('`primary` | `secondary` | `tertiary` (default `secondary`)');
    expect(guide).toContain(
      '- `name`: kebab-case identifier (required, unique within the screen).',
    );
  });

  it('can be built from a custom rule set', () => {
    expect(renderGuide({ rules: [] })).not.toContain('**single-primary-action**');
  });

  it('is committed in docs/ai and up to date', () => {
    const committed = readFileSync(new URL('docs/ai/tosyn-guide.md', root), 'utf8');
    expect(committed).toBe(guide);
  });
});

describe('exampleMarkup', () => {
  it('matches examples/bmi-calculator.tosyn', () => {
    expect(exampleMarkup).toBe(
      readFileSync(new URL('examples/bmi-calculator.tosyn', root), 'utf8'),
    );
  });

  it('passes every check', () => {
    expect(checkDocument(parseMarkup(exampleMarkup).document)).toEqual({
      valid: true,
      findings: [],
    });
  });
});
