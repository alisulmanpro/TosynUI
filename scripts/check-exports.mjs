import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const exportedPaths = [
  '@tosynui/core/styles.css',
  '@tosynui/core/tokens.css',
  '@tosynui/core/setup-demo.css',
  '@tosynui/core/package.json',
  '@tosynui/contracts',
  '@tosynui/contracts/schema',
  '@tosynui/build',
];

const resolutions = [];

for (const specifier of exportedPaths) {
  const resolved = import.meta.resolve(specifier);
  await access(new URL(resolved));
  resolutions.push({ specifier, resolved });
  console.log(specifier + ' -> ' + resolved);
}

const reportIndex = process.argv.indexOf('--report-dir');
if (reportIndex !== -1) {
  const reportDir = process.argv[reportIndex + 1];
  if (!reportDir) {
    throw new Error('Missing directory after --report-dir.');
  }
  const outputDirectory = resolve(process.cwd(), reportDir);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    resolve(outputDirectory, 'exports.json'),
    JSON.stringify({ exports: resolutions }, null, 2) + '\n',
    'utf8',
  );
}
