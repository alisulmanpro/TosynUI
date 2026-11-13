import { describe, expect, it } from 'vitest';
import bmiCalculator from './examples/bmi-calculator.json' with { type: 'json' };
import { validateDocument } from './index.js';
import type { ElementNode, TosynDocument } from './index.js';

function screen(...children: ElementNode[]): TosynDocument {
  return {
    tosyn: '0.1',
    root: {
      element: 'screen',
      attributes: { name: 'test', purpose: 'Exercise the validator.' },
      children: [{ element: 'section', attributes: { name: 'main' }, children }],
    },
  };
}

function codes(document: unknown): string[] {
  return validateDocument(document).diagnostics.map((d) => d.code);
}

describe('validateDocument', () => {
  it('accepts the BMI calculator example', () => {
    expect(validateDocument(bmiCalculator)).toEqual({ valid: true, diagnostics: [] });
  });

  it('stops at the schema when the shape is wrong', () => {
    const result = validateDocument({ tosyn: '0.1', root: { element: 'screen', extra: 1 } });
    expect(result.valid).toBe(false);
    expect(result.diagnostics.every((d) => d.code === 'invalid-structure')).toBe(true);
  });

  it('rejects an unsupported version', () => {
    expect(codes({ ...screen(), tosyn: '9.0' })).toEqual(['unsupported-version']);
  });

  it('requires the root element', () => {
    const result = validateDocument({
      tosyn: '0.1',
      root: { element: 'section', attributes: { name: 'main' } },
    });
    expect(result.diagnostics[0]).toMatchObject({ code: 'invalid-root', path: '/root/element' });
  });

  it('reports unknown elements and lists the valid ones', () => {
    const result = validateDocument(screen({ element: 'button', children: [{ text: 'Go' }] }));
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'unknown-element',
      path: '/root/children/0/children/0/element',
    });
    expect(result.diagnostics[0]!.message).toContain('action');
  });

  it('reports unknown attributes, including visual ones', () => {
    const document = screen({
      element: 'action',
      attributes: { intent: 'submit', color: 'blue' },
      children: [{ text: 'Save' }],
    });
    expect(validateDocument(document).diagnostics).toEqual([
      expect.objectContaining({
        code: 'unknown-attribute',
        path: '/root/children/0/children/0/attributes/color',
      }),
    ]);
  });

  it('reports missing required attributes', () => {
    expect(codes(screen({ element: 'action', children: [{ text: 'Save' }] }))).toEqual([
      'missing-attribute',
    ]);
  });

  it('explains invalid enum values with the allowed options', () => {
    const result = validateDocument(
      screen({
        element: 'action',
        attributes: { intent: 'submit', importance: 'urgent' },
        children: [{ text: 'Save' }],
      }),
    );
    expect(result.diagnostics[0]).toMatchObject({ code: 'invalid-attribute-value' });
    expect(result.diagnostics[0]!.message).toContain('primary, secondary, tertiary');
  });

  it('checks identifier, string and boolean attribute types', () => {
    const result = validateDocument(
      screen({
        element: 'field',
        attributes: { name: 'Height Value', label: '  ', required: 'yes' },
      }),
    );
    expect(result.diagnostics.map((d) => d.path)).toEqual([
      '/root/children/0/children/0/attributes/name',
      '/root/children/0/children/0/attributes/label',
      '/root/children/0/children/0/attributes/required',
    ]);
  });

  it('rejects children that the content model does not allow', () => {
    expect(
      codes(
        screen(
          {
            element: 'field',
            attributes: { name: 'email', label: 'Email' },
            children: [{ text: 'x' }],
          },
          {
            element: 'heading',
            children: [{ element: 'text', children: [{ text: 'Nested' }] }],
          },
        ),
      ),
    ).toEqual(['invalid-child', 'invalid-child', 'empty-content']);
  });

  it('rejects elements that are not allowed in their parent', () => {
    const document: TosynDocument = {
      tosyn: '0.1',
      root: {
        element: 'screen',
        attributes: { name: 'test', purpose: 'Exercise the validator.' },
        children: [{ element: 'heading', children: [{ text: 'Loose heading' }] }],
      },
    };
    expect(validateDocument(document).diagnostics).toEqual([
      expect.objectContaining({ code: 'invalid-child', path: '/root/children/0/element' }),
    ]);
  });

  it('rejects bare text in containers but ignores whitespace', () => {
    expect(codes(screen({ text: '\n  ' } as never))).toEqual([]);
    expect(codes(screen({ text: 'Hello' } as never))).toEqual(['invalid-child']);
  });

  it('requires text content where it is the accessible label', () => {
    expect(
      codes(screen({ element: 'action', attributes: { intent: 'submit' }, children: [] })),
    ).toEqual(['empty-content']);
  });

  it('rejects duplicate unique values', () => {
    const result = validateDocument(
      screen(
        { element: 'field', attributes: { name: 'height', label: 'Height' } },
        { element: 'field', attributes: { name: 'height', label: 'Height again' } },
      ),
    );
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'duplicate-value',
        path: '/root/children/0/children/1/attributes/name',
      }),
    ]);
  });

  it('reports every problem instead of stopping at the first', () => {
    const result = validateDocument(
      screen(
        { element: 'action', children: [] },
        { element: 'feedback', attributes: { tone: 'loud' }, children: [{ text: 'Hi' }] },
      ),
    );
    expect(result.diagnostics.map((d) => d.code).sort()).toEqual([
      'empty-content',
      'invalid-attribute-value',
      'missing-attribute',
    ]);
  });
});
