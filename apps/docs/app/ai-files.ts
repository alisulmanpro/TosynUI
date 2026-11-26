import { renderGuide } from '@tosynui/ai';
import { catalog } from '@tosynui/spec';
import { docsUrl, playgroundUrl } from './site';

/** Where the AI guide lives. Stable: link to it from prompts, project files and tools. */
export const GUIDE_PATH = '/tosyn-guide.md';

/** The AI guide, generated from the catalog and rules so it always matches the validator. */
export function guideMarkdown(): string {
  return renderGuide();
}

/**
 * The `llms.txt` file: a short, plain map of the site for AI models, in the format from
 * https://llmstxt.org. All links are absolute because models read it away from the site.
 */
export function llmsTxt(): string {
  const elements = Object.keys(catalog.elements)
    .map((name) => `\`<${name}>\``)
    .join(', ');
  return [
    '# Tosyn',
    '',
    `> Tosyn is an intent language for user interfaces. You write short markup that says what each part of a screen does and how important it is, never how it looks. Design rules and renderers decide colours, spacing and layout, so every screen stays consistent and accessible. This is language version ${catalog.specVersion}; its elements are ${elements}.`,
    '',
    'To write a screen: read the guide, write one `<screen>`, check it, and fix every error before showing it to the user.',
    '',
    '## Start here',
    '',
    `- [Writing guide](${docsUrl}${GUIDE_PATH}): Everything needed to write valid Tosyn: the elements, their attributes, the design rules and an example. Read this first.`,
    `- [Reference](${docsUrl}/): Every element, attribute and design rule, generated from the same catalog the validator uses.`,
    '',
    '## Check and render',
    '',
    `- [POST ${docsUrl}/api/check](${docsUrl}/#api): Send {"markup": "<screen ...>"}. Returns valid, and every error and warning with its line, column and how to fix it.`,
    `- [POST ${docsUrl}/api/render](${docsUrl}/#api): Send {"markup": "<screen ...>"}, optionally with theme (light, dark, system) and brand (ocean, forest). Returns a complete HTML page, or 422 with the findings when the markup has errors.`,
    `- [Playground](${playgroundUrl}): Write Tosyn and see the screen and the findings in a browser.`,
    '',
    '## Optional',
    '',
    '- [Source code](https://github.com/alisulmanpro/TosynUI): The packages (`@tosynui/spec`, `@tosynui/parser`, `@tosynui/rules`, `@tosynui/render-html`, `@tosynui/mcp` and more) and the project plan.',
    '',
  ].join('\n');
}
