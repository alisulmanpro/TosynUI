import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { createServer } from '../server.js';

/**
 * Connects a real MCP client to a fresh server in memory, so tests talk to the server exactly as
 * Claude or Cursor would, without starting a process. Close the client after each test.
 */
export async function connect(): Promise<Client> {
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(clientSide);
  return client;
}
