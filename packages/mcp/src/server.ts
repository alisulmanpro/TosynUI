import { McpServer } from '@modelcontextprotocol/server';
import { registerCheckMarkup } from './tools/check-markup.js';
import { registerRenderMarkup } from './tools/render-markup.js';
import { registerDesignScreenPrompt } from './prompts/design-screen.js';
import { registerExampleResources } from './resources/examples.js';
import { registerGuideResource } from './resources/guide.js';

export const SERVER_NAME = 'tosyn';
export const SERVER_VERSION = '0.2.0';

/**
 * Creates the Tosyn MCP server with all of its tools, resources and prompts.
 *
 * The server is created here and connected to a transport elsewhere (`bin.ts` for stdio, the
 * tests for an in-memory pair), so the same server can be tested without starting a process.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  registerCheckMarkup(server);
  registerRenderMarkup(server);

  registerGuideResource(server);
  registerExampleResources(server);

  registerDesignScreenPrompt(server);

  return server;
}
