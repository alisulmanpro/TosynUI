import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@tosynui/tokens';
import type { ColorValue } from '@tosynui/tokens';
import { brandSwatches } from './brand-swatches';
import { allBlocks } from './content';
import { checkMarkup } from './api/_shared/tosyn';
import { tokenizeMarkup } from './highlight';
import { elementsUsed, plain, tosyn } from './marks';
import { footerColumns, mainLinks } from './nav';
import { renderBlock } from './tosyn-block';

const appFile = (path: string): boolean => existsSync(new URL(path, import.meta.url));

/** Where a site path is served from, relative to this folder. */
function routeFile(href: string): string {
  const path = href.split('#')[0] ?? '';
  if (path === '/llms.txt') return './llms.txt/route.ts';
  if (path === '/tosyn-guide.md') return './tosyn-guide.md/route.ts';
  return `.${path}/page.tsx`;
}

describe('the website is written in valid Tosyn', () => {
  it('has no error or warning in any block', () => {
    for (const markup of allBlocks()) {
      const { result } = checkMarkup(markup);
      expect(result.findings, markup).toEqual([]);
    }
  });

  it('points every navigate action at a real page or an https address', () => {
    for (const markup of allBlocks()) {
      for (const match of markup.matchAll(/target="([^"]+)"/g)) {
        const target = match[1]!;
        if (target.startsWith('https://')) continue;
        expect(appFile(routeFile(target)), target).toBe(true);
      }
    }
  });
});

describe('renderBlock', () => {
  const markup = allBlocks()[2]!;

  it('writes a container, not a second <main>, and starts headings where asked', () => {
    const html = renderBlock(markup, { idPrefix: 'a', headingLevel: 2 });
    expect(html).not.toContain('<main');
    expect(html.startsWith('<div')).toBe(true);
    expect(html).toContain('<h2 ');
    expect(html).not.toContain('<h1');
  });

  it('keeps h1 when asked for level 1', () => {
    expect(renderBlock(markup, { idPrefix: 'a', headingLevel: 1 })).toContain('<h1 ');
  });

  it('gives blocks with different prefixes different ids', () => {
    const first = renderBlock(markup, { idPrefix: 'one' });
    const second = renderBlock(markup, { idPrefix: 'two' });
    const ids = (html: string): string[] =>
      [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]!);
    expect(ids(first).length).toBeGreaterThan(0);
    expect(ids(first).some((id) => ids(second).includes(id))).toBe(false);
  });

  it('stops the build on markup with a warning', () => {
    const noHeading =
      '<screen name="x" purpose="y"><section name="s"><field name="f" label="F" /></section></screen>';
    expect(() => renderBlock(noHeading, { idPrefix: 'x' })).toThrow(/form-needs-heading/);
  });
});

describe('tokenizeMarkup', () => {
  it('gives back the same text it was given', () => {
    const line = '    <field name="height" label="Height" kind="number" unit="cm" required />';
    expect(
      tokenizeMarkup(line)
        .map((token) => token.text)
        .join(''),
    ).toBe(line);
  });

  it('marks tags, attributes and strings', () => {
    const kinds = tokenizeMarkup('<action intent="submit">').map((token) => token.kind);
    expect(kinds).toContain('tag');
    expect(kinds).toContain('attr');
    expect(kinds).toContain('string');
  });
});

describe('navigation', () => {
  it('links every internal page that exists', () => {
    const links = [...mainLinks, ...footerColumns.flatMap((column) => column.links)];
    for (const link of links) {
      if (link.href.startsWith('https://')) continue;
      expect(appFile(routeFile(link.href)), link.href).toBe(true);
    }
  });
});

describe('site colours', () => {
  const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8');
  const colour = (name: string): ColorValue => {
    const found = new RegExp(`--${name}:\\s*#([0-9a-fA-F]{6})`).exec(css);
    if (!found) throw new Error(`Missing --${name} in globals.css`);
    const hex = found[1]!;
    const channel = (start: number): number => parseInt(hex.slice(start, start + 2), 16) / 255;
    return { colorSpace: 'srgb', components: [channel(0), channel(2), channel(4)] };
  };

  const pairs: [string, string, string, number][] = [
    ['text', 'site-ink', 'site-bg', 4.5],
    ['muted text', 'site-muted', 'site-bg', 4.5],
    ['muted text on tint', 'site-muted', 'site-tint', 4.5],
    ['brand text', 'site-brand', 'site-bg', 4.5],
    ['white on brand', 'site-bg', 'site-brand', 4.5],
    ['deep brand on tint', 'site-brand-deep', 'site-tint', 4.5],
    ['amber text on amber', 'site-amber-ink', 'site-amber', 4.5],
    ['input border', 'site-outline', 'site-bg', 3],
  ];

  it.each(pairs)('%s is readable', (_name, foreground, background, minimum) => {
    expect(contrastRatio(colour(foreground), colour(background))).toBeGreaterThanOrEqual(minimum);
  });
});

describe('brand swatches', () => {
  it('shows the accent of every brand in the library', () => {
    const swatches = brandSwatches();
    expect(swatches.map((swatch) => swatch.id)).toEqual(
      expect.arrayContaining(['ocean', 'forest']),
    );
    for (const swatch of swatches) expect(swatch.accent).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('TOSYN-TODO comments', () => {
  const root = fileURLToPath(new URL('.', import.meta.url));
  const buildMap = readFileSync(new URL('../design-refs/BUILD-MAP.md', import.meta.url), 'utf8');

  function sourceFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : sourceFiles(path);
      return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
    });
  }

  it('names a module that the build map lists', () => {
    const modules = new Set<string>();
    for (const file of sourceFiles(root)) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/TOSYN-TODO\(module: ([^)]+)\)/g)) {
        modules.add(match[1]!);
      }
      // A part marked as plain TS must name the module it waits for, too.
      for (const match of source.matchAll(/plain\('([^']+)'/g)) modules.add(match[1]!);
    }
    expect(modules.size).toBeGreaterThan(0);
    for (const name of modules) expect(buildMap, name).toContain(`\`${name}\``);
  });
});

describe('build marks', () => {
  it('lists the Tosyn elements a block uses, without screen and section', () => {
    expect(elementsUsed(allBlocks()[2]!)).toEqual(['heading', 'text', 'action']);
  });

  it('labels plain and Tosyn parts', () => {
    expect(plain('navigation', 'Navigation bar')).toEqual({
      'data-made': 'plain',
      'data-made-label': 'Navigation bar: plain TS',
      'data-module': 'navigation',
    });
    expect(tosyn(['heading', 'text'])['data-made-label']).toBe('Written in Tosyn: heading, text');
  });
});
