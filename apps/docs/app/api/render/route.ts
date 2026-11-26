import { brands, renderPage } from '@tosynui/render-html';
import type { Theme } from '@tosynui/render-html';
import { fail, json, preflight, readJson, readMarkup } from '../_shared/http';
import { checkMarkup } from '../_shared/tosyn';

const THEMES: readonly Theme[] = ['light', 'dark', 'system'];

export function OPTIONS(): Response {
  return preflight();
}

/**
 * POST /api/render with `{ "markup": "<screen ...>", "theme"?: "light" | "dark" | "system",
 * "brand"?: "ocean" | "forest" }`.
 *
 * Answers 200 with a complete HTML page. Markup with errors is not rendered: the answer is 422
 * with the findings, so the caller can fix them and send it again.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const markup = readMarkup(body);
  if (markup instanceof Response) return markup;

  const theme = body.theme ?? 'system';
  if (typeof theme !== 'string' || !THEMES.includes(theme as Theme)) {
    return fail(400, `"theme" must be one of: ${THEMES.join(', ')}.`);
  }
  const brand = body.brand;
  if (brand !== undefined && (typeof brand !== 'string' || !Object.hasOwn(brands, brand))) {
    return fail(400, `"brand" must be one of: ${Object.keys(brands).join(', ')}.`);
  }

  const { result, document } = checkMarkup(markup);
  if (!document) return json({ ...result, rendered: false }, 422);

  const html = renderPage(document, {
    theme: theme as Theme,
    ...(brand === undefined ? {} : { brand }),
  });
  return json({ ...result, rendered: true, html });
}

export function GET(): Response {
  return fail(405, 'Use POST with {"markup": "<screen ...>"}.');
}
