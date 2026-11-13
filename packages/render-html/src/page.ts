import { themeCss } from '@tosynui/tokens';
import type { TokenTree } from '@tosynui/tokens';
import type { TosynDocument } from '@tosynui/spec';
import { renderDocument } from './render.js';
import { componentCss } from './styles.generated.js';

export type Theme = 'light' | 'dark' | 'system';

export interface PageOptions {
  /** Document title. Defaults to the screen's purpose. */
  title?: string;
  /** Language of the content. Defaults to `en`. */
  lang?: string;
  /** Colour theme. `system` follows the operating system. Defaults to `system`. */
  theme?: Theme;
  /** Token trees that replace the built-in light theme, for a custom brand. */
  tokens?: TokenTree[];
  /** Token trees that override the light theme in dark mode. */
  darkTokens?: TokenTree[];
}

const PAGE_CSS = `@layer tosyn.page {
  body {
    margin: 0;
    min-height: 100vh;
  }
}`;

/** The complete stylesheet: layer order, theme variables and component styles. */
export function stylesheet(options: Pick<PageOptions, 'tokens' | 'darkTokens'> = {}): string {
  const theme = themeCss({
    ...(options.tokens ? { light: options.tokens } : {}),
    ...(options.darkTokens ? { dark: options.darkTokens } : {}),
  });
  return `@layer tosyn.tokens, tosyn.components, tosyn.page;\n${theme}\n${componentCss}\n${PAGE_CSS}\n`;
}

/** Renders a valid document as a standalone HTML page with its styles inlined. */
export function renderPage(document: TosynDocument, options: PageOptions = {}): string {
  const purpose = document.root.attributes?.purpose;
  const title = options.title ?? (typeof purpose === 'string' ? purpose : 'Tosyn screen');
  const theme = options.theme ?? 'system';
  const escapeText = (value: string): string =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

  return `<!doctype html>
<html lang="${escapeText(options.lang ?? 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeText(title)}</title>
<style>
${stylesheet(options)}</style>
</head>
<body data-tosyn${theme === 'system' ? '' : ` data-theme="${theme}"`}>
${renderDocument(document, { scope: false })}
</body>
</html>
`;
}
