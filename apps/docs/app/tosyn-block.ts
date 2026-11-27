import { renderDocument } from '@tosynui/render-html';
import { checkMarkup } from './api/_shared/tosyn';

export interface BlockOptions {
  /** Prefix for generated element ids, so two blocks on one page never share an id. */
  idPrefix: string;
  /** Level of the block's heading. The renderer always starts at 1. Defaults to 2. */
  headingLevel?: 1 | 2 | 3 | 4;
}

/**
 * Checks Tosyn markup and renders it to an HTML fragment.
 *
 * The website is written with its own library, so any markup that has an error or a warning stops
 * the build instead of shipping.
 *
 * TOSYN-TODO(module: render-html fragment): `renderDocument` always writes a `<main>` and always
 * starts headings at level 1. Until it can write a plain container and start at any level, this
 * function rewrites the tags. Replace it when render-html has those options.
 */
export function renderBlock(markup: string, options: BlockOptions): string {
  const { result, document } = checkMarkup(markup);
  if (!document || result.findings.length > 0) {
    const problems = result.findings.map((finding) => `${finding.code}: ${finding.message}`);
    throw new Error(`Invalid Tosyn block "${options.idPrefix}": ${problems.join(' | ')}`);
  }

  let html = renderDocument(document, { scope: false, idPrefix: options.idPrefix });
  html = html.replace(/^<main\b/, '<div').replace(/<\/main>$/, '</div>');

  const level = options.headingLevel ?? 2;
  if (level !== 1) {
    html = html.replaceAll('<h1 ', `<h${level} `).replaceAll('</h1>', `</h${level}>`);
  }
  return html;
}
