import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseMarkup } from '@tosynui/parser';
import { componentCss, renderDocument, renderPage, stylesheet } from './index.js';

const examplesDirectory = new URL('../../../examples/', import.meta.url);

function documentFrom(markup: string) {
  const { document, diagnostics } = parseMarkup(markup);
  expect(diagnostics).toEqual([]);
  return document!;
}

function render(body: string): string {
  return renderDocument(
    documentFrom(`<screen name="demo" purpose="Test rendering.">${body}</screen>`),
  );
}

describe('renderDocument', () => {
  it('wraps the screen in a scoped main element', () => {
    expect(render('')).toBe('<main class="ts-screen" data-tosyn data-screen="demo"></main>');
    expect(
      renderDocument(documentFrom('<screen name="x" purpose="p"></screen>'), { scope: false }),
    ).not.toContain('data-tosyn');
  });

  it('derives heading levels from section order and depth', () => {
    const html = render(
      '<section name="a"><heading>A</heading><section name="a1"><heading>A1</heading></section></section>' +
        '<section name="b"><heading>B</heading><section name="b1"><heading>B1</heading></section></section>',
    );
    expect(html.match(/<h(\d)[^>]*>([^<]+)</g)).toEqual([
      '<h1 class="ts-heading" id="demo-a-heading">A<',
      '<h2 class="ts-heading" id="demo-a1-heading">A1<',
      '<h2 class="ts-heading" id="demo-b-heading">B<',
      '<h3 class="ts-heading" id="demo-b1-heading">B1<',
    ]);
  });

  it('labels sections by their heading', () => {
    expect(render('<section name="a"><heading>Title</heading></section>')).toContain(
      '<section class="ts-section" data-section="a" data-emphasis="default" aria-labelledby="demo-a-heading">',
    );
  });

  it('renders fields as labelled native controls inside a form', () => {
    const html = render(
      '<section name="a"><heading>Form</heading><field name="weight" label="Weight" kind="number" unit="kg" hint="Without shoes." required /></section>',
    );
    expect(html).toContain('<form class="ts-form" data-form="a">');
    expect(html).toContain(
      '<label class="ts-label" for="demo-field-weight">Weight<span class="ts-required" aria-hidden="true">*</span></label>',
    );
    expect(html).toContain(
      '<input id="demo-field-weight" name="weight" required aria-describedby="demo-field-weight-unit demo-field-weight-hint" type="number" inputmode="decimal" step="any">',
    );
    expect(html).toContain('<span class="ts-unit" id="demo-field-weight-unit">kg</span>');
    expect(html).toContain('<p class="ts-hint" id="demo-field-weight-hint">Without shoes.</p>');
  });

  it.each([
    ['email', '<input id="demo-field-f" name="f" type="email" autocomplete="email">'],
    ['password', '<input id="demo-field-f" name="f" type="password">'],
    ['multiline', '<textarea id="demo-field-f" name="f" rows="4"></textarea>'],
    ['date', '<input id="demo-field-f" name="f" type="date">'],
  ])('renders %s fields', (kind, expected) => {
    expect(
      render(`<section name="a"><field name="f" label="F" kind="${kind}" /></section>`),
    ).toContain(expected);
  });

  it('groups consecutive actions and maps intents to native elements', () => {
    const html = render(
      '<section name="a"><action intent="submit" importance="primary">Save</action><action intent="reset">Reset</action>' +
        '<text>Between</text><action intent="navigate" importance="tertiary" target="/help">Help</action><action intent="delete">Delete</action></section>',
    );
    expect(html).toContain(
      '<div class="ts-actions"><button class="ts-action" data-intent="submit" data-importance="primary" type="submit">Save</button>' +
        '<button class="ts-action" data-intent="reset" data-importance="secondary" type="reset">Reset</button></div>',
    );
    expect(html).toContain(
      '<div class="ts-actions"><a class="ts-action" data-intent="navigate" data-importance="tertiary" href="/help">Help</a>' +
        '<button class="ts-action" data-intent="delete" data-importance="secondary" type="button">Delete</button></div>',
    );
  });

  it('announces feedback with the right role', () => {
    expect(
      render('<section name="a"><feedback tone="error">Failed</feedback></section>'),
    ).toContain('<div class="ts-feedback" data-tone="error" role="alert">Failed</div>');
    expect(
      render('<section name="a"><feedback tone="success">Saved</feedback></section>'),
    ).toContain('role="status"');
  });

  it('escapes text and attribute values', () => {
    const html = render(
      '<section name="a"><heading>&lt;script&gt;</heading><field name="q" label="&quot;Quote&quot; &amp; more" /></section>',
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;Quote&quot; &amp; more');
    expect(html).not.toContain('<script>');
  });

  it('keeps generated ids unique', () => {
    const document = documentFrom(
      '<screen name="s" purpose="p"><section name="a"><heading>One</heading></section><section name="a"><heading>Two</heading></section></screen>',
    );
    const ids = [...renderDocument(document, { idPrefix: 'x-' }).matchAll(/id="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(ids).toEqual(['x-s-a-heading', 'x-s-a-heading-2']);
  });

  it.each(readdirSync(examplesDirectory).filter((file) => file.endsWith('.tosyn')))(
    'renders %s',
    (file) => {
      const html = renderDocument(
        documentFrom(readFileSync(new URL(file, examplesDirectory), 'utf8')),
      );
      expect(html).toMatch(
        /^<main class="ts-screen" data-tosyn data-screen="[a-z-]+">.*<\/main>$/s,
      );
    },
  );
});

describe('renderPage', () => {
  const document = documentFrom(
    '<screen name="s" purpose="Check &lt;the&gt; page."><section name="a"><heading>Hi</heading></section></screen>',
  );

  it('produces a standalone page with inlined styles', () => {
    const page = renderPage(document);
    expect(page).toMatch(/^<!doctype html>/);
    expect(page).toContain('<title>Check &lt;the> page.</title>');
    expect(page).toContain('<body data-tosyn>');
    expect(page).toContain('<main class="ts-screen" data-screen="s">');
    expect(page).toContain('--tosyn-color-accent');
    expect(page).toContain('.ts-action');
  });

  it('can force a theme, title and language', () => {
    const page = renderPage(document, { theme: 'dark', title: 'Custom', lang: 'ur' });
    expect(page).toContain('<body data-tosyn data-theme="dark">');
    expect(page).toContain('<title>Custom</title>');
    expect(page).toContain('<html lang="ur">');
  });

  it('accepts custom brand tokens', () => {
    const css = stylesheet({
      tokens: [
        {
          color: {
            $type: 'color',
            accent: { $value: { colorSpace: 'srgb', components: [0, 0.5, 0], hex: '#008000' } },
          },
        },
      ],
      darkTokens: [],
    });
    expect(css).toContain('--tosyn-color-accent: #008000;');
    expect(css.startsWith('@layer tosyn.tokens, tosyn.components, tosyn.page;')).toBe(true);
  });
});

describe('componentCss', () => {
  it('matches styles.css', () => {
    const source = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
    expect(componentCss).toBe(source);
  });

  it('only uses theme variables that the tokens define', () => {
    const defined = new Set(stylesheet().match(/--tosyn-[a-z0-9-]+(?=:)/g));
    const used = new Set(componentCss.match(/--tosyn-[a-z0-9-]+/g));
    expect([...used].filter((name) => !defined.has(name))).toEqual([]);
  });
});
