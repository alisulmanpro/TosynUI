import { fail, json, preflight, readJson, readMarkup } from '../_shared/http';
import { checkMarkup } from '../_shared/tosyn';

export function OPTIONS(): Response {
  return preflight();
}

/**
 * POST /api/check with `{ "markup": "<screen ...>" }`.
 *
 * Answers 200 with every error and warning, each with its line, column and how to fix it. Invalid
 * markup is a normal answer (`"valid": false`), not an HTTP error.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const markup = readMarkup(body);
  if (markup instanceof Response) return markup;

  return json(checkMarkup(markup).result);
}

export function GET(): Response {
  return fail(405, 'Use POST with {"markup": "<screen ...>"}.');
}
