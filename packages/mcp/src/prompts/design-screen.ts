import type { McpServer } from '@modelcontextprotocol/server';
import { renderGuide } from '@tosynui/ai';
import { z } from 'zod';
import { GUIDE_URI } from '../resources/guide.js';

export function registerDesignScreenPrompt(server: McpServer): void {
  server.registerPrompt(
    'design_screen',
    {
      title: 'Design a screen in Tosyn',
      description:
        'Designs one screen in Tosyn from a short description, checks it and fixes every error.',
      argsSchema: z.object({
        description: z
          .string()
          .min(1)
          .describe('What the screen is for, for example "a login screen for pharmacy staff".'),
      }),
    },
    ({ description }) => ({
      description: `Design a Tosyn screen: ${description}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'resource',
            resource: { uri: GUIDE_URI, mimeType: 'text/markdown', text: renderGuide() },
          },
        },
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Design one screen in Tosyn for: ${description}`,
              '',
              'Follow the guide above. Then:',
              '1. Call the check_markup tool with your markup.',
              '2. Fix every error it reports, and warnings unless you have a clear reason, and check again.',
              '3. When it is valid, reply with the final markup in an html code block and one sentence on the design.',
            ].join('\n'),
          },
        },
      ],
    }),
  );
}
