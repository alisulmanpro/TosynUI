import Ajv2020 from 'ajv/dist/2020.js';
import { catalog as defaultCatalog } from './catalog.js';
import documentSchema from './schema/document.schema.json' with { type: 'json' };
import type {
  AttributeDefinition,
  AttributeValue,
  Catalog,
  Diagnostic,
  ElementNode,
  TosynDocument,
  ValidationResult,
} from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
const checkDocumentShape = ajv.compile<TosynDocument>(documentSchema);

const IDENTIFIER = /^[a-z][a-z0-9-]*$/;

interface WalkContext {
  catalog: Catalog;
  diagnostics: Diagnostic[];
  /** Values seen for unique attributes, keyed by `element.attribute`. */
  seen: Map<string, Map<string, string>>;
}

/**
 * Validates a document against the intent language.
 *
 * Checks run in two stages. The JSON Schema checks the shape of the tree; when the shape is
 * wrong, validation stops there. The catalog then checks elements, attributes, nesting, content
 * and unique values, and reports every problem it finds rather than stopping at the first.
 */
export function validateDocument(
  value: unknown,
  catalog: Catalog = defaultCatalog,
): ValidationResult {
  if (!checkDocumentShape(value)) {
    const diagnostics: Diagnostic[] = (checkDocumentShape.errors ?? []).map((error) => ({
      code: 'invalid-structure',
      message: `Document ${error.message ?? 'is invalid'}.`,
      path: error.instancePath || '/',
    }));
    return { valid: false, diagnostics };
  }

  if (value.tosyn !== catalog.specVersion) {
    return {
      valid: false,
      diagnostics: [
        {
          code: 'unsupported-version',
          message: `Document uses version "${value.tosyn}", but this catalog defines version "${catalog.specVersion}".`,
          path: '/tosyn',
        },
      ],
    };
  }

  const context: WalkContext = { catalog, diagnostics: [], seen: new Map() };

  if (value.root.element !== catalog.root) {
    context.diagnostics.push({
      code: 'invalid-root',
      message: `A document must start with <${catalog.root}>, not <${value.root.element}>.`,
      path: '/root/element',
    });
  }

  walk(value.root, '/root', context);
  return { valid: context.diagnostics.length === 0, diagnostics: context.diagnostics };
}

function walk(node: ElementNode, path: string, context: WalkContext): void {
  const definition = context.catalog.elements[node.element];
  if (!definition) {
    const known = Object.keys(context.catalog.elements).join(', ');
    context.diagnostics.push({
      code: 'unknown-element',
      message: `<${node.element}> is not part of the intent language. Use one of: ${known}.`,
      path: `${path}/element`,
    });
    return;
  }

  checkAttributes(node, path, definition.attributes, context);

  const children = node.children ?? [];

  if (definition.content === 'none') {
    if (children.length > 0) {
      context.diagnostics.push({
        code: 'invalid-child',
        message: `<${node.element}> cannot contain content; describe it with attributes instead.`,
        path: `${path}/children`,
      });
    }
    return;
  }

  if (definition.content === 'text') {
    let text = '';
    children.forEach((child, index) => {
      if ('text' in child) {
        text += child.text;
      } else {
        context.diagnostics.push({
          code: 'invalid-child',
          message: `<${node.element}> may contain only text, not <${child.element}>.`,
          path: `${path}/children/${index}`,
        });
      }
    });
    if (text.trim() === '') {
      context.diagnostics.push({
        code: 'empty-content',
        message: `<${node.element}> needs text content; it is what people and assistive technology read.`,
        path,
      });
    }
    return;
  }

  children.forEach((child, index) => {
    const childPath = `${path}/children/${index}`;
    if ('text' in child) {
      if (child.text.trim() !== '') {
        context.diagnostics.push({
          code: 'invalid-child',
          message: `Text cannot appear directly inside <${node.element}>. Wrap it in <text> or <heading>.`,
          path: childPath,
        });
      }
      return;
    }
    const childKnown = child.element in context.catalog.elements;
    if (childKnown && !definition.children.includes(child.element)) {
      context.diagnostics.push({
        code: 'invalid-child',
        message: `<${child.element}> is not allowed inside <${node.element}>. Allowed: ${definition.children.join(', ')}.`,
        path: `${childPath}/element`,
      });
    }
    walk(child, childPath, context);
  });
}

function checkAttributes(
  node: ElementNode,
  path: string,
  rules: Record<string, AttributeDefinition>,
  context: WalkContext,
): void {
  const attributes = node.attributes ?? {};

  for (const [name, value] of Object.entries(attributes)) {
    const attributePath = `${path}/attributes/${name}`;
    const rule = rules[name];
    if (!rule) {
      const known = Object.keys(rules);
      context.diagnostics.push({
        code: 'unknown-attribute',
        message: known.length
          ? `<${node.element}> has no "${name}" attribute. Known attributes: ${known.join(', ')}.`
          : `<${node.element}> takes no attributes; remove "${name}".`,
        path: attributePath,
      });
      continue;
    }

    const problem = describeInvalidValue(value, rule);
    if (problem) {
      context.diagnostics.push({
        code: 'invalid-attribute-value',
        message: `<${node.element} ${name}> ${problem}`,
        path: attributePath,
      });
      continue;
    }

    if (rule.unique && typeof value === 'string') {
      const key = `${node.element}.${name}`;
      const values = context.seen.get(key) ?? new Map<string, string>();
      context.seen.set(key, values);
      const firstPath = values.get(value);
      if (firstPath) {
        context.diagnostics.push({
          code: 'duplicate-value',
          message: `Another <${node.element}> already uses ${name}="${value}" (at ${firstPath}). Each must be unique within the screen.`,
          path: attributePath,
        });
      } else {
        values.set(value, attributePath);
      }
    }
  }

  for (const [name, rule] of Object.entries(rules)) {
    if (rule.required && !(name in attributes)) {
      context.diagnostics.push({
        code: 'missing-attribute',
        message: `<${node.element}> requires a "${name}" attribute: ${rule.description}`,
        path: `${path}/attributes`,
      });
    }
  }
}

/** Returns a sentence describing why a value is invalid, or `undefined` when it is valid. */
function describeInvalidValue(
  value: AttributeValue,
  rule: AttributeDefinition,
): string | undefined {
  switch (rule.type) {
    case 'boolean':
      return typeof value === 'boolean' ? undefined : 'must be a boolean.';
    case 'string':
      if (typeof value !== 'string') return 'must be text.';
      return value.trim() === '' ? 'must not be empty.' : undefined;
    case 'identifier':
      return typeof value === 'string' && IDENTIFIER.test(value)
        ? undefined
        : 'must be a kebab-case identifier such as "order-summary".';
    case 'enum': {
      const values = rule.values ?? [];
      return typeof value === 'string' && values.includes(value)
        ? undefined
        : `must be one of: ${values.join(', ')}.`;
    }
  }
}
