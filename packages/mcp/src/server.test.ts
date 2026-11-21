import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SERVER_NAME, SERVER_VERSION, createServer } from './index.js';

/**
 * Connects a real MCP client to the server in memory, so tests talk to the server exactly as
 * Claude or Cursor would, without starting a process.
 */
async function connect(): Promise<Client> {
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(clientSide);
  return client;
}

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

  it('lists its tools with descriptions', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toContain('say_hello');
    for (const tool of tools) expect(tool.description).toBeTruthy();
  });

  it('runs say_hello', async () => {
    const result = await client.callTool({ name: 'say_hello', arguments: { name: 'Ali' } });
    expect(result.content).toEqual([{ type: 'text', text: 'Assalam-o-Alaikum, Ali!' }]);
  });

  it('rejects invalid input before the tool runs', async () => {
    const result = await client.callTool({ name: 'say_hello', arguments: { name: 5 } });
    expect(result.isError).toBe(true);
  });

  // Level 2 (yours): add tests for check_markup and render_markup here.
});
