import type { McpServer } from '@modelcontextprotocol/server';
import { renderGuide } from '@tosynui/ai';

export const GUIDE_URI = 'tosyn://guide';

export function registerGuideResource(server: McpServer): void {
  server.registerResource(
    'guide',
    GUIDE_URI,
    {
      title: 'Tosyn writing guide',
      description:
        'How to write Tosyn markup: every element, attribute and design rule, with an example. Read this before writing a Tosyn screen.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: renderGuide() }],
    }),
  );
}
