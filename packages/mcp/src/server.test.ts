import { readFileSync } from 'node:fs';
import type { Client } from '@modelcontextprotocol/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SERVER_NAME, SERVER_VERSION } from './index.js';
import { connect } from './test/connect.js';

describe('Tosyn MCP server', () => {
  let client: Client;

  beforeEach(async () => {
    client = await connect();
  });

  afterEach(async () => {
    await client.close();
  });

  it('identifies itself', () => {
    expect(client.getServerVersion()).toMatchObject({ name: SERVER_NAME, version: SERVER_VERSION });
  });

  it('reports the version in package.json, so a release cannot report the wrong number', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { version: string };
    expect(SERVER_VERSION).toBe(manifest.version);
  });

  it('lists its tools with descriptions and output schemas', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual(['check_markup', 'render_markup']);
    for (const tool of tools) {
      expect(tool.description).toBeTruthy();
      expect(tool.outputSchema).toBeDefined();
    }
  });

  it('advertises tools, resources and prompts', () => {
    expect(client.getServerCapabilities()).toMatchObject({
      tools: expect.any(Object),
      resources: expect.any(Object),
      prompts: expect.any(Object),
    });
  });

  it('rejects invalid input before a tool runs', async () => {
    const result = await client.callTool({ name: 'check_markup', arguments: { markup: 5 } });
    expect(result.isError).toBe(true);
  });
});
