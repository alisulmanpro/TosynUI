import { describe, expect, it } from 'vitest';
import { catalog, validateCatalog } from './index.js';

describe('element catalog', () => {
  it('is well formed', () => {
    expect(validateCatalog(catalog)).toEqual({ valid: true, diagnostics: [] });
  });

  it('defines the root element', () => {
    expect(catalog.elements[catalog.root]).toBeDefined();
  });

  it('rejects children that are not defined', () => {
    const broken = structuredClone(catalog);
    broken.elements.section = { ...broken.elements.section!, children: ['section', 'carousel'] };
    const result = validateCatalog(broken);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-element', path: '/elements/section/children/1' }),
    );
  });

  it('rejects enum defaults outside the allowed values', () => {
    const broken = structuredClone(catalog);
    broken.elements.action!.attributes.importance!.default = 'urgent';
    expect(validateCatalog(broken).diagnostics).toContainEqual(
      expect.objectContaining({ code: 'invalid-attribute-value' }),
    );
  });

  it('rejects malformed catalogs by shape', () => {
    const result = validateCatalog({ specVersion: 'next', elements: {} });
    expect(result.valid).toBe(false);
    expect(result.diagnostics.every((d) => d.code === 'invalid-structure')).toBe(true);
  });
});
