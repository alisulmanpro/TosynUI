import { rules as defaultRules } from '@tosynui/rules';
import type { Rule } from '@tosynui/rules';
import { catalog as defaultCatalog } from '@tosynui/spec';
import type { AttributeDefinition, Catalog } from '@tosynui/spec';
import { exampleMarkup } from './example.js';

export interface GuideOptions {
  catalog?: Catalog;
  rules?: readonly Rule[];
}

function describeValues(attribute: AttributeDefinition): string {
  switch (attribute.type) {
    case 'enum':
      return (attribute.values ?? []).map((value) => `\`${value}\``).join(' | ');
    case 'boolean':
      return 'present or absent';
    case 'identifier':
      return 'kebab-case identifier';
    case 'string':
      return 'text';
  }
}

/**
 * Generates instructions that teach an AI model to write Tosyn markup.
 *
 * The guide is built from the element catalog and the design rules, so it always matches what the
 * validator and checker accept. Give it to a model as a system prompt, a project instruction file
 * or an attachment.
 */
export function renderGuide(options: GuideOptions = {}): string {
  const catalog = options.catalog ?? defaultCatalog;
  const rules = options.rules ?? defaultRules;
  const lines: string[] = [];

  lines.push(
    `# Writing user interfaces in Tosyn ${catalog.specVersion}`,
    '',
    'Tosyn is an intent language for user interfaces. You describe what each part of a screen does and how important it is. You never describe how it looks: renderers and design rules decide colours, spacing, typography and layout, so every screen stays consistent and accessible.',
    '',
    '## How to answer',
    '',
    `- Write exactly one \`<${catalog.root}>\` element per screen, inside a code block tagged \`html\`.`,
    '- Use only the elements and attributes listed below. Never add `class`, `style`, `id`, colours, sizes or any other visual detail; they are errors in Tosyn.',
    '- Never choose heading levels. Use `<heading>`; its level comes from where its section sits.',
    '- Write labels and copy as the final text a person will read.',
    '- Self-closing tags are fine for elements without content, for example `<field ... />`.',
    '- If you receive diagnostics or rule findings for your markup, fix every one and return the whole corrected screen.',
    '',
    '## Example',
    '',
    '```html',
    exampleMarkup.trimEnd(),
    '```',
    '',
    '## Elements',
    '',
  );

  for (const [name, element] of Object.entries(catalog.elements)) {
    lines.push(`### \`<${name}>\``, '', element.summary, '', element.guidance, '');
    lines.push(
      `- Content: ${
        element.content === 'elements'
          ? element.children.map((child) => `\`<${child}>\``).join(', ')
          : element.content === 'text'
            ? 'text only'
            : 'none'
      }`,
    );
    for (const [attributeName, attribute] of Object.entries(element.attributes)) {
      const notes = [
        attribute.required ? 'required' : undefined,
        attribute.unique ? 'unique within the screen' : undefined,
        attribute.default !== undefined ? `default \`${String(attribute.default)}\`` : undefined,
      ].filter(Boolean);
      lines.push(
        `- \`${attributeName}\`: ${describeValues(attribute)}${notes.length ? ` (${notes.join(', ')})` : ''}. ${attribute.description}`,
      );
    }
    lines.push('');
  }

  lines.push(
    '## Design rules',
    '',
    'Errors make a screen invalid. Fix warnings unless you have a clear reason not to.',
    '',
  );
  for (const rule of rules) {
    lines.push(`- **${rule.id}** (${rule.severity}): ${rule.summary} ${rule.rationale}`);
  }
  lines.push('');

  return lines.join('\n');
}
