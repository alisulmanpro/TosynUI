import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateDocument } from '@tosynui/spec';
import bmiCalculator from '@tosynui/spec/examples/bmi-calculator.json' with { type: 'json' };
import { attachLocations, parseMarkup } from './index.js';

const examplesDirectory = new URL('../../../examples/', import.meta.url);

function example(name: string): string {
  return readFileSync(new URL(name, examplesDirectory), 'utf8');
}

describe('parseMarkup', () => {
  it('produces the same IR as the JSON example', () => {
    const { document, diagnostics } = parseMarkup(example('bmi-calculator.tosyn'));
    expect(diagnostics).toEqual([]);
    expect(document).toEqual(bmiCalculator);
  });

  it.each(readdirSync(examplesDirectory).filter((file) => file.endsWith('.tosyn')))(
    'parses %s into a valid document',
    (file) => {
      const { document, diagnostics } = parseMarkup(example(file));
      expect(diagnostics).toEqual([]);
      expect(validateDocument(document).diagnostics).toEqual([]);
    },
  );

  it('accepts self-closing and explicitly closed fields alike', () => {
    const selfClosing = parseMarkup(
      '<screen name="a" purpose="p"><section name="s"><field name="x" label="X" /><field name="y" label="Y" /></section></screen>',
    );
    const closed = parseMarkup(
      '<screen name="a" purpose="p"><section name="s"><field name="x" label="X"></field><field name="y" label="Y"></field></section></screen>',
    );
    expect(selfClosing.document).toEqual(closed.document);
    expect(selfClosing.document?.root.children?.[0]).toMatchObject({
      children: [{ element: 'field' }, { element: 'field' }],
    });
  });

  it('reads boolean attributes from the catalog', () => {
    const { document } = parseMarkup(
      '<screen name="a" purpose="p"><section name="s"><field name="x" label="X" required /><field name="y" label="Y" required="false" /></section></screen>',
    );
    const fields = document?.root.children?.[0];
    expect(fields).toMatchObject({
      children: [
        { attributes: { name: 'x', label: 'X', required: true } },
        { attributes: { name: 'y', label: 'Y', required: false } },
      ],
    });
  });

  it('collapses whitespace in text and decodes entities', () => {
    const { document } = parseMarkup(`
      <screen name="a" purpose="p">
        <section name="s">
          <heading>
            Terms   &amp;
            conditions
          </heading>
        </section>
      </screen>`);
    expect(document?.root.children?.[0]).toMatchObject({
      children: [{ element: 'heading', children: [{ text: 'Terms & conditions' }] }],
    });
  });

  it('lower-cases names and ignores comments', () => {
    const { document } = parseMarkup(
      '<!-- note --><SCREEN NAME="a" Purpose="p"><Section name="s"></Section></SCREEN>',
    );
    expect(document?.root).toEqual({
      element: 'screen',
      attributes: { name: 'a', purpose: 'p' },
      children: [{ element: 'section', attributes: { name: 's' } }],
    });
  });

  it('reads the language version from the root element', () => {
    const { document } = parseMarkup('<screen tosyn="9.0" name="a" purpose="p"></screen>');
    expect(document?.tosyn).toBe('9.0');
    expect(document?.root.attributes).toEqual({ name: 'a', purpose: 'p' });
  });

  it('keeps unknown elements so the validator can explain them', () => {
    const { document } = parseMarkup(
      '<screen name="a" purpose="p"><section name="s"><button class="primary">Go</button></section></screen>',
    );
    const result = validateDocument(document);
    expect(result.diagnostics.map((d) => d.code)).toEqual(['unknown-element']);
  });

  it('reports unclosed elements with their position', () => {
    const { diagnostics } = parseMarkup(
      '<screen name="a" purpose="p">\n  <section name="s">\n    <text>Hello\n</screen>',
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: 'syntax-error', line: 2, column: 3 }),
    );
  });

  it('reports a missing root', () => {
    const { document, diagnostics } = parseMarkup('   ');
    expect(document).toBeUndefined();
    expect(diagnostics).toEqual([expect.objectContaining({ code: 'invalid-root' })]);
  });

  it('reports extra roots and stray text', () => {
    const { document, diagnostics } = parseMarkup(
      'Hello\n<screen name="a" purpose="p"></screen>\n<screen name="b" purpose="q"></screen>',
    );
    expect(document?.root.attributes?.name).toBe('a');
    expect(diagnostics.map((d) => [d.code, d.line])).toEqual([
      ['invalid-child', 1],
      ['invalid-root', 3],
    ]);
  });
});

describe('attachLocations', () => {
  it('places validation diagnostics on the closest element', () => {
    const source = [
      '<screen name="a" purpose="p">',
      '  <section name="s">',
      '    <action intent="go">Next</action>',
      '  </section>',
      '</screen>',
    ].join('\n');
    const { document, locations } = parseMarkup(source);
    const located = attachLocations(validateDocument(document).diagnostics, locations);
    expect(located).toEqual([
      expect.objectContaining({ code: 'invalid-attribute-value', line: 3, column: 5 }),
    ]);
  });

  it('leaves diagnostics that already have a position untouched', () => {
    const diagnostic = { code: 'syntax-error' as const, message: 'x', path: '/', line: 9 };
    expect(attachLocations([diagnostic], new Map())).toEqual([diagnostic]);
  });
});
