import type { Client } from '@modelcontextprotocol/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connect } from '../test/connect.js';

describe('check_markup', () => {
  let client: Client;

  beforeEach(async () => {
    client = await connect();
  });

  afterEach(async () => {
    await client.close();
  });

  const check = (markup: string) =>
    client.callTool({ name: 'check_markup', arguments: { markup } });

  it('accepts valid markup', async () => {
    const result = await check(
      '<screen name="s" purpose="p"><section name="a"><heading>Hi</heading></section></screen>',
    );
    expect(result.structuredContent).toEqual({ valid: true, errors: 0, warnings: 0, findings: [] });
  });

  it('reports errors with their line and column', async () => {
    const result = await check(
      '<screen name="s" purpose="p">\n  <section name="a">\n    <action intent="go">Next</action>\n  </section>\n</screen>',
    );
    expect(result.structuredContent).toMatchObject({
      valid: false,
      errors: 1,
      findings: [{ code: 'invalid-attribute-value', line: 3, column: 5 }],
    });
  });

  it('reports warnings without making the markup invalid', async () => {
    const result = await check(
      '<screen name="s" purpose="p"><section name="a"><action intent="delete" importance="primary">Delete</action></section></screen>',
    );
    expect(result.structuredContent).toMatchObject({ valid: true, warnings: 1 });
  });

  it('reports syntax errors such as unclosed tags', async () => {
    const result = await check('<screen name="s" purpose="p"><section name="a">');
    expect(result.structuredContent).toMatchObject({
      valid: false,
      findings: [{ code: 'syntax-error' }, { code: 'syntax-error' }],
    });
  });

  it('accepts a screen that uses result and after-submit feedback (0.2)', async () => {
    const result = await check(
      '<screen name="s" purpose="p"><section name="a"><heading>Check</heading><field name="n" label="Number" kind="number" /><action intent="submit" importance="primary">Go</action><result name="r" label="Answer" /><feedback tone="success" when="after-submit">Done.</feedback></section></screen>',
    );
    expect(result.structuredContent).toEqual({ valid: true, errors: 0, warnings: 0, findings: [] });
  });

  it('warns when a result has no submit action (0.2)', async () => {
    const result = await check(
      '<screen name="s" purpose="p"><section name="a"><result name="r" label="Answer" /></section></screen>',
    );
    expect(result.structuredContent).toMatchObject({
      valid: true,
      warnings: 1,
      findings: [{ code: 'result-needs-submit', severity: 'warning' }],
    });
  });

  it('warns when after-submit feedback has no submit action (0.2)', async () => {
    const result = await check(
      '<screen name="s" purpose="p"><section name="a"><heading>Hi</heading><feedback tone="success" when="after-submit">Saved.</feedback></section></screen>',
    );
    expect(result.structuredContent).toMatchObject({
      valid: true,
      findings: [{ code: 'after-submit-needs-submit' }],
    });
  });

  it('rejects a bad feedback timing (0.2)', async () => {
    const result = await check(
      '<screen name="s" purpose="p"><section name="a"><feedback tone="success" when="never">Hi</feedback></section></screen>',
    );
    expect(result.structuredContent).toMatchObject({ valid: false });
  });
});
