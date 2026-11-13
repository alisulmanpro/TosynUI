import Ajv2020 from 'ajv/dist/2020.js';
import catalogData from './catalog/elements.json' with { type: 'json' };
import catalogSchema from './schema/catalog.schema.json' with { type: 'json' };
import type { Catalog, Diagnostic, ValidationResult } from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
const checkCatalogShape = ajv.compile<Catalog>(catalogSchema);

/** The element catalog for the current version of the intent language. */
export const catalog: Catalog = catalogData as Catalog;

/**
 * Checks that a catalog is well formed: its shape matches the catalog schema, its root exists,
 * every child it references is defined, and every default is an allowed value.
 */
export function validateCatalog(value: unknown): ValidationResult {
  if (!checkCatalogShape(value)) {
    const diagnostics: Diagnostic[] = (checkCatalogShape.errors ?? []).map((error) => ({
      code: 'invalid-structure',
      message: `Catalog ${error.message ?? 'is invalid'}.`,
      path: error.instancePath || '/',
    }));
    return { valid: false, diagnostics };
  }

  const diagnostics: Diagnostic[] = [];
  const defined = new Set(Object.keys(value.elements));

  if (!defined.has(value.root)) {
    diagnostics.push({
      code: 'unknown-element',
      message: `Root element "${value.root}" is not defined in the catalog.`,
      path: '/root',
    });
  }

  for (const [name, definition] of Object.entries(value.elements)) {
    definition.children.forEach((child, index) => {
      if (!defined.has(child)) {
        diagnostics.push({
          code: 'unknown-element',
          message: `"${name}" allows child "${child}", which is not defined in the catalog.`,
          path: `/elements/${name}/children/${index}`,
        });
      }
    });
    if (definition.content !== 'elements' && definition.children.length > 0) {
      diagnostics.push({
        code: 'invalid-child',
        message: `"${name}" lists children but its content model is "${definition.content}".`,
        path: `/elements/${name}/children`,
      });
    }
    for (const [attribute, rule] of Object.entries(definition.attributes)) {
      if (rule.default === undefined) continue;
      const allowed =
        rule.type === 'boolean'
          ? typeof rule.default === 'boolean'
          : typeof rule.default === 'string' &&
            (rule.type !== 'enum' || (rule.values ?? []).includes(rule.default));
      if (!allowed) {
        diagnostics.push({
          code: 'invalid-attribute-value',
          message: `Default of "${name}.${attribute}" is not a valid ${rule.type} value.`,
          path: `/elements/${name}/attributes/${attribute}/default`,
        });
      }
    }
  }

  return { valid: diagnostics.length === 0, diagnostics };
}
