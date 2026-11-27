import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { catalog } from '@tosynui/spec';
import { GET as getGuide } from './tosyn-guide.md/route';
import { GET as getLlms } from './llms.txt/route';
import { GUIDE_PATH, guideMarkdown, llmsTxt } from './ai-files';
import { docsUrl } from './site';

describe('llms.txt', () => {
  const text = llmsTxt();

  it('follows the llms.txt format: title, summary, sections of links', () => {
    expect(text.startsWith('# Tosyn\n\n> ')).toBe(true);
    expect(text).toContain('\n## Start here\n');
    expect(text).toContain('\n## Optional\n');
  });

  it('names the language version and every element', () => {
    expect(text).toContain(`language version ${catalog.specVersion}`);
    for (const name of Object.keys(catalog.elements)) expect(text).toContain(`\`<${name}>\``);
  });

  it('uses absolute links and points at the guide and the API', () => {
    expect(text).toContain(`[Writing guide](${docsUrl}${GUIDE_PATH})`);
    expect(text).toContain(`${docsUrl}/api/check`);
    expect(text).toContain(`${docsUrl}/api/render`);
    const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]!);
    expect(links.length).toBeGreaterThan(4);
    expect(links.every((link) => link.startsWith('https://'))).toBe(true);
  });

  it('links the pages that exist: the reference at /docs and the API at /for-ai', () => {
    expect(text).toContain(`${docsUrl}/docs`);
    expect(text).toContain(`${docsUrl}/for-ai#http-api`);
    expect(text).not.toContain(`${docsUrl}/#api`);
  });

  it('is served as plain text that browsers show instead of downloading', async () => {
    const response = getLlms();
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('cache-control')).toContain('s-maxage');
    expect(await response.text()).toBe(text);
  });
});

describe('the guide at a stable address', () => {
  it('is the same guide as docs/ai/tosyn-guide.md', () => {
    const committed = readFileSync(
      new URL('../../../docs/ai/tosyn-guide.md', import.meta.url),
      'utf8',
    );
    expect(guideMarkdown()).toBe(committed);
  });

  it('is served as plain text, so browsers show it instead of downloading it, and any website may read it', async () => {
    const response = getGuide();
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    const body = await response.text();
    expect(body).toBe(guideMarkdown());
    expect(body).toContain(`# Writing user interfaces in Tosyn ${catalog.specVersion}`);
    expect(body).toContain('### `<result>`');
  });

  it('is linked from llms.txt by the same path', () => {
    expect(GUIDE_PATH).toBe('/tosyn-guide.md');
  });
});
