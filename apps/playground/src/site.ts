/**
 * Public address of the Tosyn docs site.
 *
 * There is no custom domain yet, so the docs live on vercel.app. When a domain is added, set
 * `VITE_DOCS_URL` in Vercel; no code change is needed.
 */
const DEFAULT_DOCS_URL = 'https://tosynui.vercel.app';

const configured = import.meta.env.VITE_DOCS_URL as string | undefined;

export const docsUrl = configured ?? DEFAULT_DOCS_URL;
