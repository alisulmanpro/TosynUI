import { Parser } from 'htmlparser2';
import { catalog as defaultCatalog } from '@tosynui/spec';
import type {
  AttributeValue,
  Catalog,
  Diagnostic,
  ElementNode,
  TosynDocument,
  TosynNode,
} from '@tosynui/spec';

/** A 1-based position in the source markup. */
export interface SourceLocation {
  line: number;
  column: number;
  /** 0-based character offset. */
  offset: number;
}

export interface ParseResult {
  /** The parsed document, or `undefined` when the markup contains no element at all. */
  document: TosynDocument | undefined;
  /** Start of the opening tag of each element, keyed by the element's JSON Pointer. */
  locations: Map<string, SourceLocation>;
  /** Problems found while parsing. Validation problems are reported by `validateDocument`. */
  diagnostics: Diagnostic[];
}

/** Anything reported against a path in the document, such as a diagnostic or a rule finding. */
export interface Locatable {
  path: string;
  line?: number;
  column?: number;
}

export interface ParseOptions {
  /** Catalog used to read boolean attributes. Defaults to the current catalog. */
  catalog?: Catalog;
}

/** HTML elements that never have a closing tag; closing them implicitly is not an error. */
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

interface OpenElement {
  node: ElementNode;
  offset: number;
}

/**
 * Parses Tosyn markup into the intermediate representation.
 *
 * The parser is forgiving: it accepts self-closing tags (`<field ... />`), lower-cases names,
 * decodes HTML entities and ignores comments. Unknown elements and attributes are kept so that
 * `validateDocument` can report them with helpful messages.
 */
export function parseMarkup(source: string, options: ParseOptions = {}): ParseResult {
  const catalog = options.catalog ?? defaultCatalog;
  const lineStarts = indexLines(source);
  const position = (offset: number): SourceLocation => locate(lineStarts, offset);

  const diagnostics: Diagnostic[] = [];
  const topLevel: { node: TosynNode; offset: number }[] = [];
  const offsets = new Map<ElementNode, number>();
  const stack: OpenElement[] = [];

  const append = (node: TosynNode, offset: number): void => {
    const parent = stack.at(-1);
    if (parent) {
      (parent.node.children ??= []).push(node);
    } else {
      topLevel.push({ node, offset });
    }
  };

  const parser: Parser = new Parser(
    {
      onopentag(name, attributes) {
        const node: ElementNode = { element: name };
        const definition = catalog.elements[name];
        const entries = Object.entries(attributes);
        if (entries.length > 0) {
          node.attributes = Object.fromEntries(
            entries.map(([attribute, value]) => [
              attribute,
              readAttribute(value, definition?.attributes[attribute]?.type === 'boolean'),
            ]),
          );
        }
        const offset = parser.startIndex;
        offsets.set(node, offset);
        append(node, offset);
        stack.push({ node, offset });
      },
      ontext(text) {
        const parent = stack.at(-1)?.node;
        const last = parent?.children?.at(-1);
        if (last && 'text' in last) {
          last.text += text;
        } else {
          append({ text }, parser.startIndex);
        }
      },
      onclosetag(name, isImplied) {
        const open = stack.pop();
        const selfClosed = source.slice(parser.endIndex - 1, parser.endIndex + 1) === '/>';
        if (isImplied && open && !selfClosed && !VOID_ELEMENTS.has(name)) {
          const { line, column } = position(open.offset);
          diagnostics.push({
            code: 'syntax-error',
            message: `<${name}> is never closed. Add </${name}> or close it with "/>".`,
            path: '/',
            line,
            column,
          });
        }
      },
    },
    { recognizeSelfClosing: true, lowerCaseTags: true, lowerCaseAttributeNames: true },
  );
  parser.end(source);

  const roots: ElementNode[] = [];
  for (const { node, offset } of topLevel) {
    if ('text' in node) {
      if (node.text.trim() !== '') {
        const { line, column } = position(offset);
        diagnostics.push({
          code: 'invalid-child',
          message: `Text must be inside <${catalog.root}>.`,
          path: '/',
          line,
          column,
        });
      }
    } else {
      roots.push(node);
    }
  }

  const [root, ...extra] = roots;
  for (const node of extra) {
    const { line, column } = position(offsets.get(node) ?? 0);
    diagnostics.push({
      code: 'invalid-root',
      message: `A document has exactly one <${catalog.root}>; found another <${node.element}>.`,
      path: '/',
      line,
      column,
    });
  }

  const locations = new Map<string, SourceLocation>();
  if (!root) {
    diagnostics.push({
      code: 'invalid-root',
      message: `No elements found. A document starts with <${catalog.root}>.`,
      path: '/',
      line: 1,
      column: 1,
    });
    return { document: undefined, locations, diagnostics };
  }

  let version = catalog.specVersion;
  const declared = root.attributes?.tosyn;
  if (root.attributes && declared !== undefined) {
    version = String(declared);
    delete root.attributes.tosyn;
    if (Object.keys(root.attributes).length === 0) delete root.attributes;
  }

  normalize(root, catalog, '/root', (path, node) => {
    locations.set(path, position(offsets.get(node) ?? 0));
  });

  return { document: { tosyn: version, root }, locations, diagnostics };
}

/**
 * Adds `line` and `column` to diagnostics from their paths, using the closest located ancestor.
 * Diagnostics that already have a position are returned unchanged.
 */
export function attachLocations<T extends Locatable>(
  diagnostics: readonly T[],
  locations: ReadonlyMap<string, SourceLocation>,
): T[] {
  return diagnostics.map((diagnostic) => {
    if (diagnostic.line !== undefined) return diagnostic;
    let path = diagnostic.path;
    while (path.length > 0) {
      const location = locations.get(path);
      if (location) return { ...diagnostic, line: location.line, column: location.column };
      path = path.slice(0, path.lastIndexOf('/'));
    }
    return diagnostic;
  });
}

function readAttribute(value: string, isBoolean: boolean): AttributeValue {
  if (!isBoolean) return value;
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

/** Collapses whitespace, merges text and drops whitespace between elements. */
function normalize(
  node: ElementNode,
  catalog: Catalog,
  path: string,
  visit: (path: string, node: ElementNode) => void,
): void {
  visit(path, node);
  const content = catalog.elements[node.element]?.content;
  const children = node.children ?? [];
  const kept: TosynNode[] = [];

  for (const child of children) {
    if ('text' in child) {
      const text = child.text.replace(/\s+/g, ' ');
      if (content === 'text') {
        kept.push({ text });
      } else if (text.trim() !== '') {
        kept.push({ text: text.trim() });
      }
    } else {
      kept.push(child);
    }
  }

  if (content === 'text') {
    const first = kept[0];
    const last = kept.at(-1);
    if (first && 'text' in first) first.text = first.text.trimStart();
    if (last && 'text' in last) last.text = last.text.trimEnd();
  }

  const filtered = kept.filter((child) => !('text' in child) || child.text !== '');
  if (filtered.length > 0) {
    node.children = filtered;
  } else {
    delete node.children;
  }

  filtered.forEach((child, index) => {
    if (!('text' in child)) normalize(child, catalog, `${path}/children/${index}`, visit);
  });
}

function indexLines(source: string): number[] {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') starts.push(index + 1);
  }
  return starts;
}

function locate(lineStarts: readonly number[], offset: number): SourceLocation {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if ((lineStarts[middle] ?? 0) <= offset) low = middle;
    else high = middle - 1;
  }
  return { line: low + 1, column: offset - (lineStarts[low] ?? 0) + 1, offset };
}
