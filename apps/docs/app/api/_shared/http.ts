/** The most markup the API accepts, in characters. A screen is a few hundred lines at most. */
export const MAX_MARKUP_LENGTH = 50_000;

/** The most request body the API reads, in characters. A little more than the markup it holds. */
export const MAX_BODY_LENGTH = 64_000;

/**
 * Anyone may call the API from any website: it holds no accounts or cookies and only turns text
 * into findings or HTML.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
} as const;

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { ...CORS, 'Cache-Control': 'no-store' } });
}

/** An error the caller can fix, with a message that says how. */
export function fail(status: number, error: string): Response {
  return json({ error }, status);
}

/** The answer to a browser's preflight request. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

/** Reads a JSON object from the request, or returns the error response to send instead. */
export async function readJson(request: Request): Promise<Record<string, unknown> | Response> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_LENGTH) {
    return fail(413, `The request is too large. Send at most ${MAX_BODY_LENGTH} characters.`);
  }
  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) {
    return fail(413, `The request is too large. Send at most ${MAX_BODY_LENGTH} characters.`);
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail(400, 'The body must be JSON, for example {"markup": "<screen ...>"}.');
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return fail(400, 'The body must be a JSON object, for example {"markup": "<screen ...>"}.');
  }
  return body as Record<string, unknown>;
}

/** Reads the `markup` field, or returns the error response to send instead. */
export function readMarkup(body: Record<string, unknown>): string | Response {
  const { markup } = body;
  if (typeof markup !== 'string') {
    return fail(400, 'Send the Tosyn markup as a string in the "markup" field.');
  }
  if (markup.length > MAX_MARKUP_LENGTH) {
    return fail(413, `The markup is too long. Send at most ${MAX_MARKUP_LENGTH} characters.`);
  }
  return markup;
}
