import type { AttributeValue, ElementNode, TosynDocument, TosynNode } from '@tosynui/spec';

export interface RenderOptions {
  /** Prefix for generated `id` attributes, to keep them unique when several screens share a page. */
  idPrefix?: string;
  /**
   * Whether the screen element carries `data-tosyn`, which scopes the theme variables.
   * Turn off when an ancestor already has it, as `renderPage` does. Defaults to true.
   */
  scope?: boolean;
}

interface Context {
  ids: Set<string>;
  idPrefix: string;
  screen: string;
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

function attrs(values: Record<string, string | boolean | undefined>): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escape(String(value))}"`))
    .join('');
}

function read(node: ElementNode, name: string): AttributeValue | undefined {
  return node.attributes?.[name];
}

function readString(node: ElementNode, name: string, fallback?: string): string | undefined {
  const value = read(node, name);
  return typeof value === 'string' ? value : fallback;
}

function elementChildren(node: ElementNode): ElementNode[] {
  return (node.children ?? []).filter((child): child is ElementNode => 'element' in child);
}

function text(node: ElementNode): string {
  return escape(
    (node.children ?? [])
      .map((child: TosynNode) => ('text' in child ? child.text : ''))
      .join('')
      .trim(),
  );
}

function uniqueId(context: Context, ...parts: string[]): string {
  const base = [context.idPrefix + context.screen, ...parts].join('-');
  let id = base;
  for (let counter = 2; context.ids.has(id); counter += 1) id = `${base}-${counter}`;
  context.ids.add(id);
  return id;
}

/**
 * Renders a valid document to an HTML fragment.
 *
 * The output uses native elements (`section`, `h1`–`h6`, `form`, `label`, `input`, `button`, `a`)
 * so it works without JavaScript and is understood by assistive technology. Styling comes from
 * `componentCss` and the theme variables from `@tosynui/tokens`.
 *
 * Heading levels are derived: the heading of the first top-level section is `h1` and its nested
 * sections continue from there; other top-level sections start at `h2`.
 */
export function renderDocument(document: TosynDocument, options: RenderOptions = {}): string {
  const root = document.root;
  const context: Context = {
    ids: new Set(),
    idPrefix: options.idPrefix ?? '',
    screen: readString(root, 'name', 'screen') ?? 'screen',
  };

  const sections = elementChildren(root)
    .map((section, index) => renderSection(section, 1, index === 0 ? 0 : 1, context))
    .join('');

  return `<main${attrs({
    class: 'ts-screen',
    'data-tosyn': options.scope ?? true,
    'data-screen': context.screen,
  })}>${sections}</main>`;
}

function renderSection(node: ElementNode, depth: number, offset: number, context: Context): string {
  const name = readString(node, 'name', 'section') ?? 'section';
  const children = elementChildren(node);
  const heading = children.find((child) => child.element === 'heading');
  const headingId = heading ? uniqueId(context, name, 'heading') : undefined;
  const level = Math.min(depth + offset, 6);

  const parts: string[] = [];
  let actions: string[] = [];
  const flushActions = (): void => {
    if (actions.length > 0) parts.push(`<div class="ts-actions">${actions.join('')}</div>`);
    actions = [];
  };

  for (const child of children) {
    if (child.element === 'action') {
      actions.push(renderAction(child));
      continue;
    }
    flushActions();
    switch (child.element) {
      case 'heading':
        parts.push(
          `<h${level}${attrs({ class: 'ts-heading', id: child === heading ? headingId : undefined })}>${text(child)}</h${level}>`,
        );
        break;
      case 'text':
        parts.push(
          `<p${attrs({ class: 'ts-text', 'data-tone': readString(child, 'tone', 'default') })}>${text(child)}</p>`,
        );
        break;
      case 'field':
        parts.push(renderField(child, context));
        break;
      case 'feedback':
        parts.push(renderFeedback(child));
        break;
      case 'section':
        parts.push(renderSection(child, depth + 1, offset, context));
        break;
    }
  }
  flushActions();

  const hasFields = children.some((child) => child.element === 'field');
  const body = hasFields
    ? `<form${attrs({ class: 'ts-form', 'data-form': name })}>${parts.join('')}</form>`
    : parts.join('');

  return `<section${attrs({
    class: 'ts-section',
    'data-section': name,
    'data-emphasis': readString(node, 'emphasis', 'default'),
    'aria-labelledby': headingId,
  })}>${body}</section>`;
}

const INPUT_TYPES: Record<string, string> = {
  text: 'text',
  number: 'number',
  email: 'email',
  password: 'password',
  tel: 'tel',
  date: 'date',
};

const AUTOCOMPLETE: Record<string, string> = { email: 'email', tel: 'tel' };

function renderField(node: ElementNode, context: Context): string {
  const name = readString(node, 'name', 'field') ?? 'field';
  const kind = readString(node, 'kind', 'text') ?? 'text';
  const label = escape(readString(node, 'label', name) ?? name);
  const hint = readString(node, 'hint');
  const unit = readString(node, 'unit');
  const required = read(node, 'required') === true;

  const id = uniqueId(context, 'field', name);
  const unitId = unit ? `${id}-unit` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [unitId, hintId].filter(Boolean).join(' ') || undefined;

  const shared = { id, name, required, 'aria-describedby': describedBy };
  const control =
    kind === 'multiline'
      ? `<textarea${attrs({ ...shared, rows: '4' })}></textarea>`
      : `<input${attrs({
          ...shared,
          type: INPUT_TYPES[kind] ?? 'text',
          inputmode: kind === 'number' ? 'decimal' : undefined,
          step: kind === 'number' ? 'any' : undefined,
          autocomplete: AUTOCOMPLETE[kind],
        })}>`;

  return (
    `<div class="ts-field">` +
    `<label${attrs({ class: 'ts-label', for: id })}>${label}${required ? '<span class="ts-required" aria-hidden="true">*</span>' : ''}</label>` +
    `<div${attrs({ class: 'ts-control', 'data-kind': kind })}>${control}${unit ? `<span${attrs({ class: 'ts-unit', id: unitId })}>${escape(unit)}</span>` : ''}</div>` +
    (hint ? `<p${attrs({ class: 'ts-hint', id: hintId })}>${escape(hint)}</p>` : '') +
    `</div>`
  );
}

const BUTTON_TYPES: Record<string, string> = { submit: 'submit', reset: 'reset' };

function renderAction(node: ElementNode): string {
  const intent = readString(node, 'intent', 'submit') ?? 'submit';
  const shared = {
    class: 'ts-action',
    'data-intent': intent,
    'data-importance': readString(node, 'importance', 'secondary'),
  };
  if (intent === 'navigate') {
    return `<a${attrs({ ...shared, href: readString(node, 'target', '#') })}>${text(node)}</a>`;
  }
  return `<button${attrs({ ...shared, type: BUTTON_TYPES[intent] ?? 'button' })}>${text(node)}</button>`;
}

function renderFeedback(node: ElementNode): string {
  const tone = readString(node, 'tone', 'info') ?? 'info';
  return `<div${attrs({
    class: 'ts-feedback',
    'data-tone': tone,
    role: tone === 'error' ? 'alert' : 'status',
  })}>${text(node)}</div>`;
}
