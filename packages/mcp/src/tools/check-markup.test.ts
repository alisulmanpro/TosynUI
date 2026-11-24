import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../server.js';

describe('check_markup', () => {
  let client: Client;

  beforeEach(async () => {
    const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
    await createServer().connect(serverSide);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientSide);
  });

  afterEach(async () => {
    await client.close();
  });

  const check = (markup: string) => client.callTool({ name: 'check_markup', arguments: { markup } });

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
});
