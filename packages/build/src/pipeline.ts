import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import { assertComponentContract } from '@tosynui/contracts';
import type { ComponentContract } from '@tosynui/contracts';

export type TokenValue = string | number;
export interface TokenTree {
  [key: string]: TokenValue | TokenTree;
}

export interface BuildOptions {
  inputPath: string;
  tokensPath: string;
  contractPath: string;
  outputDir: string;
}

function flattenTokens(tree: TokenTree, prefix: string[] = []): Array<[string, TokenValue]> {
  const flattened: Array<[string, TokenValue]> = [];
  for (const [key, value] of Object.entries(tree)) {
    const nextPrefix = [...prefix, key];
    if (typeof value === 'object' && value !== null) {
      flattened.push(...flattenTokens(value, nextPrefix));
    } else if (typeof value === 'string' || typeof value === 'number') {
      flattened.push([nextPrefix.join('-'), value]);
    }
  }
  return flattened;
}

export function renderTokens(tokens: TokenTree): string {
  const declarations = flattenTokens(tokens)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([name, value]) => `  --tosyn-${name}: ${value};`)
    .join('\n');
  return `[data-tosyn] {\n${declarations}\n}\n`;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown;
}

async function processCss(path: string): Promise<string> {
  const source = await readFile(path, 'utf8');
  const result = await postcss([postcssImport()]).process(source, { from: path });
  return `${result.css.trim()}\n`;
}

export async function buildStyles(options: BuildOptions): Promise<void> {
  const inputPath = resolve(options.inputPath);
  const tokensPath = resolve(options.tokensPath);
  const contractPath = resolve(options.contractPath);
  const outputDir = resolve(options.outputDir);
  const contract = (await readJson(contractPath)) as ComponentContract;
  assertComponentContract(contract);
  const tokens = (await readJson(tokensPath)) as TokenTree;
  const fullCss = `${renderTokens(tokens)}\n${await processCss(inputPath)}`;
  const demoCss = await processCss(join(dirname(inputPath), 'setup-demo.css'));

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'tokens.css'), renderTokens(tokens), 'utf8'),
    writeFile(join(outputDir, 'tosynui.css'), fullCss, 'utf8'),
    writeFile(join(outputDir, 'setup-demo.css'), demoCss, 'utf8'),
    writeFile(
      join(outputDir, 'setup-demo.contract.json'),
      `${JSON.stringify(contract, null, 2)}\n`,
      'utf8',
    ),
  ]);
}
