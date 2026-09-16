import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [, , source, destination] = process.argv;
if (!source || !destination) throw new Error('copy-file requires source and destination paths.');
const destinationPath = resolve(destination);
await mkdir(dirname(destinationPath), { recursive: true });
await copyFile(resolve(source), destinationPath);
