import { ResourceTemplate } from '@modelcontextprotocol/server';
import type { McpServer } from '@modelcontextprotocol/server';
import { examples } from '../examples.generated.js';

/** Tosyn markup is HTML-like but not HTML, so it is served as plain text. */
const MIME_TYPE = 'text/plain';

export function exampleUri(name: string): string {
  return `tosyn://examples/${name}`;
}

export function registerExampleResources(server: McpServer): void {
  const names = Object.keys(examples);

  server.registerResource(
    'example',
    new ResourceTemplate('tosyn://examples/{name}', {
      // Lets clients show every example without guessing names.
      list: async () => ({
        resources: names.map((name) => ({
          uri: exampleUri(name),
          name,
          title: `Example: ${name}`,
          mimeType: MIME_TYPE,
        })),
      }),
      // Autocompletes the {name} part of the URI.
      complete: {
        name: (value) => names.filter((name) => name.startsWith(value)),
      },
    }),
    {
      title: 'Tosyn example screens',
      description: 'Complete, valid Tosyn screens to learn from or start with.',
      mimeType: MIME_TYPE,
    },
    async (uri, { name }) => {
      const key = Array.isArray(name) ? name[0] : name;
      const markup = key === undefined ? undefined : examples[key];
      if (markup === undefined) {
        throw new Error(`No example named "${String(key)}". Available: ${names.join(', ')}.`);
      }
      return { contents: [{ uri: uri.href, mimeType: MIME_TYPE, text: markup }] };
    },
  );
}
