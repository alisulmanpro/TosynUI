import type { Client } from '@modelcontextprotocol/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connect } from '../test/connect.js';

const VALID =
  '<screen name="s" purpose="Say hello."><section name="a"><heading>Hello</heading><text>World</text></section></screen>';

describe('render_markup', () => {
  let client: Client;

  beforeEach(async () => {
    client = await connect();
  });

  afterEach(async () => {
    await client.close();
  });

  const render = (args: Record<string, unknown>) =>
    client.callTool({ name: 'render_markup', arguments: args });

  it('renders valid markup as a full page in the system theme by default', async () => {
    const result = await render({ markup: VALID });
    expect(result.structuredContent).toMatchObject({ rendered: true, errors: [] });
    const html = (result.structuredContent as { html: string }).html;
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<body data-tosyn>');
    expect(html).toContain('<h1 class="ts-heading"');
    expect(result.content).toEqual([{ type: 'text', text: html }]);
  });

  it('applies the requested theme', async () => {
    const result = await render({ markup: VALID, theme: 'dark' });
    expect((result.structuredContent as { html: string }).html).toContain(
      '<body data-tosyn data-theme="dark">',
    );
  });

  it('returns errors instead of rendering invalid markup', async () => {
    const result = await render({
      markup:
        '<screen name="s" purpose="p">\n  <section name="a">\n    <button>Go</button>\n  </section>\n</screen>',
    });
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toEqual({
      rendered: false,
      errors: [expect.stringMatching(/^3:5 error unknown-element/)],
    });
  });

  it('renders markup that only has warnings', async () => {
    const result = await render({
      markup:
        '<screen name="s" purpose="p"><section name="a"><action intent="delete" importance="primary">Delete</action></section></screen>',
    });
    expect(result.structuredContent).toMatchObject({ rendered: true });
  });

  it('rejects an unknown theme', async () => {
    const result = await render({ markup: VALID, theme: 'blue' });
    expect(result.isError).toBe(true);
  });

  it('renders result and after-submit feedback (0.2)', async () => {
    const result = await render({
      markup:
        '<screen name="s" purpose="p"><section name="a"><heading>Check</heading><field name="n" label="Number" kind="number" /><action intent="submit" importance="primary">Go</action><result name="r" label="Answer" /><feedback tone="success" when="after-submit">Done.</feedback></section></screen>',
    });
    expect(result.structuredContent).toMatchObject({ rendered: true });
    const html = (result.structuredContent as { html: string }).html;
    expect(html).toContain('<output class="ts-output"');
    expect(html).toMatch(/<[a-z]+ [^>]*hidden[^>]*>Done\./);
  });
});
