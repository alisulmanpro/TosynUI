import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Embeds every examples/*.tosyn file in a TypeScript module, keyed by file name without extension.
// Usage: node scripts/embed-examples.mjs <examples-dir> <output.ts>
const [, , directory, output] = process.argv;
if (!directory || !output) throw new Error('Usage: embed-examples.mjs <examples-dir> <output.ts>');

const files = (await readdir(resolve(directory))).filter((file) => file.endsWith('.tosyn')).sort();
const examples = {};
for (const file of files) {
  examples[file.slice(0, -'.tosyn'.length)] = await readFile(resolve(directory, file), 'utf8');
}

const source =
  '// Generated from examples/*.tosyn by scripts/embed-examples.mjs. Do not edit.\n' +
  `export const examples: Readonly<Record<string, string>> = ${JSON.stringify(examples, null, 2)};\n`;
await writeFile(resolve(output), source, 'utf8');
