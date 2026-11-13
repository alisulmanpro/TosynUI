import { access } from 'node:fs/promises';

// Resolves every public export of the workspace packages so a broken `exports` map fails CI.
const exportedPaths = [
  '@tosynui/spec',
  '@tosynui/spec/catalog.json',
  '@tosynui/spec/schema/catalog.json',
  '@tosynui/spec/schema/document.json',
  '@tosynui/spec/examples/bmi-calculator.json',
  '@tosynui/spec/package.json',
];

for (const specifier of exportedPaths) {
  const resolved = import.meta.resolve(specifier);
  await access(new URL(resolved));
  console.log(`${specifier} -> ${resolved}`);
}
