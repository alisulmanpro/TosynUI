import { docsUrl } from './site';

/** A one-line check request, shown on the home page. */
export const CURL_SHORT = `curl -X POST ${docsUrl}/api/check \\
  -H "Content-Type: application/json" \\
  -d '{"markup": "<screen …>"}'`;

/** A check request that works as written, shown in the HTTP API reference. */
export const CURL_EXAMPLE = `curl -X POST ${docsUrl}/api/check \\
  -H "Content-Type: application/json" \\
  -d '{"markup": "<screen name=\\"demo\\" purpose=\\"Say hello.\\"><section name=\\"main\\"><heading>Hello</heading></section></screen>"}'`;

export const MCP_COMMAND = 'claude mcp add tosyn -- npx -y @tosynui/mcp';
