import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Embeds a stylesheet in a TypeScript module so it can be imported in Node and in the browser.
// Usage: node scripts/embed-css.mjs <input.css> <output.ts> <exportName>
const [, , input, output, exportName] = process.argv;
if (!input || !output || !exportName) {
  throw new Error('Usage: embed-css.mjs <input.css> <output.ts> <exportName>');
}

const css = await readFile(resolve(input), 'utf8');
const source =
  `// Generated from ${input.split('/').at(-1)} by scripts/embed-css.mjs. Do not edit.\n` +
  `export const ${exportName} = ${JSON.stringify(css)};\n`;
await writeFile(resolve(output), source, 'utf8');
