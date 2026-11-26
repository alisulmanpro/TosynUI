import { guideMarkdown } from '../ai-files';

// Built once at deploy time, from the same catalog and rules the validator uses.
export const dynamic = 'force-static';

// Plain text, not text/markdown, so a browser shows the guide instead of downloading it.
export function GET(): Response {
  return new Response(guideMarkdown(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
