import { llmsTxt } from '../ai-files';

// Built once at deploy time: the content only changes when the catalog or the site address does.
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(llmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
