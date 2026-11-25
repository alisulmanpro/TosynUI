/**
 * Public addresses of the Tosyn sites.
 *
 * There is no custom domain yet, so both sites live on vercel.app. When a domain is added, change
 * the environment variables in Vercel; no code change is needed.
 */
const DEFAULT_DOCS_URL = 'https://tosynui.vercel.app';
const DEFAULT_PLAYGROUND_URL = 'https://tosynui-play.vercel.app';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/**
 * Address of this docs site. Vercel sets `VERCEL_PROJECT_PRODUCTION_URL` (a host name without
 * `https://`) on every deployment, including previews, so links always point at production.
 */
export const docsUrl = productionHost ? `https://${productionHost}` : DEFAULT_DOCS_URL;

/** Address of the playground. Set `NEXT_PUBLIC_PLAYGROUND_URL` to change it. */
export const playgroundUrl = process.env.NEXT_PUBLIC_PLAYGROUND_URL ?? DEFAULT_PLAYGROUND_URL;
