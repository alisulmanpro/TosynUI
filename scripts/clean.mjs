import { readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const generatedDirectories = [
  ['.', '.turbo'],
  ['.', 'coverage'],
  ['.', 'playwright-report'],
  ['.', 'test-results'],
  ['packages', 'dist'],
  ['apps', 'dist'],
  ['apps', '.next'],
];

const root = fileURLToPath(new URL('..', import.meta.url));

for (const [parent, child] of generatedDirectories) {
  const parentPath = resolve(root, parent);
  if (parent === '.') {
    await rm(resolve(parentPath, child), { recursive: true, force: true });
    continue;
  }
  const children = await readdir(parentPath, { withFileTypes: true });
  for (const entry of children) {
    await rm(resolve(parentPath, entry.name, child), { recursive: true, force: true });
  }
}

console.log('Removed generated TosynUI output; source files and pnpm-lock.yaml were preserved.');
