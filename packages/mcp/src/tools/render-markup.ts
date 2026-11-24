import type { McpServer } from '@modelcontextprotocol/server';
import { parseMarkup } from '@tosynui/parser';
import { renderPage } from '@tosynui/render-html';
import { z } from 'zod';
import { checkMarkup, describeFinding } from './check-markup.js';

export function registerRenderMarkup(server: McpServer): void {
  server.registerTool(
    'render_markup',
    {
      title: 'Render Tosyn markup',
      description:
        'Renders a Tosyn screen as a complete, accessible HTML page with styles inlined. Use it when the user wants to see, save or ship the screen. Markup with errors is not rendered; the errors are returned instead, so fix them and call again.',
      inputSchema: z.object({
        markup: z.string().describe('The full Tosyn markup, starting with <screen>.'),
        theme: z
          .enum(['light', 'dark', 'system'])
          .default('system')
          .describe('Colour theme. "system" follows the viewer\'s operating system.'),
      }),
      outputSchema: z.object({
        rendered: z.boolean().describe('True when the page was rendered.'),
        html: z.string().optional().describe('The HTML page, when rendered.'),
        errors: z.array(z.string()).describe('Errors that stopped rendering, one per line.'),
      }),
    },
    async ({ markup, theme }) => {
      const { valid, findings } = checkMarkup(markup);
      const document = valid ? parseMarkup(markup).document : undefined;

      if (!document) {
        const errors = findings
          .filter((finding) => finding.severity === 'error')
          .map(describeFinding);
        return {
          content: [
            {
              type: 'text',
              text: [
                'Not rendered: the markup has errors. Fix them and call again.',
                ...errors,
              ].join('\n'),
            },
          ],
          structuredContent: { rendered: false, errors },
        };
      }

      const html = renderPage(document, { theme });
      return {
        content: [{ type: 'text', text: html }],
        structuredContent: { rendered: true, html, errors: [] },
      };
    },
  );
}
