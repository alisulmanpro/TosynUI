import { McpServer } from '@modelcontextprotocol/server';
import { registerCheckMarkup } from './tools/check-markup.js';
import { registerRenderMarkup } from './tools/render-markup.js';

export const SERVER_NAME = 'tosyn';
export const SERVER_VERSION = '0.1.0';

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

  // Level 3: resources and prompts.
  //   - resource tosyn://guide: the AI guide from @tosynui/ai
  //   - prompt design_screen:   asks the model to design a screen in Tosyn

  return server;
}
