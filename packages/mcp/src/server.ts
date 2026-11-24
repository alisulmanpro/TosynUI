import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { registerCheckMarkup } from './tools/check-markup.js';

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

  // Level 1: a starter tool to learn the shape of a tool. Remove it once the real tools exist.
  server.registerTool(
    'say_hello',
    {
      title: 'Say hello',
      description: 'Greets a person by name. A starter tool for learning MCP.',
      inputSchema: z.object({ name: z.string().min(1).describe('Name of the person to greet') }),
    },
    async ({ name }) => ({
      content: [{ type: 'text', text: `Assalam-o-Alaikum, ${name}!` }],
    }),
  );

  // Level 2 (yours): register the real tools. See README.md for the full task list.
  registerCheckMarkup(server)

  // Level 3 (yours): resources and prompts.
  //   - resource tosyn://guide: the AI guide from @tosynui/ai
  //   - prompt design_screen:   asks the model to design a screen in Tosyn

  return server;
}
