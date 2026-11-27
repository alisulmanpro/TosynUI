import { playgroundUrl } from './site';

export const repoUrl = 'https://github.com/alisulmanpro/tosynui';
export const mcpGuideUrl = `${repoUrl}/tree/main/packages/mcp#readme`;
export const npmUrl = 'https://www.npmjs.com/search?q=%40tosynui';

/** The button at the right of the navigation bar. */
export const playgroundLink: NavLink = { label: 'Open playground', href: playgroundUrl };

export interface NavLink {
  label: string;
  href: string;
}

/** The main navigation, in order. The same pages appear in the footer. */
export const mainLinks: readonly NavLink[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'For AI', href: '/for-ai' },
  { label: 'Playground', href: playgroundUrl },
  { label: 'Changelog', href: '/changelog' },
  { label: 'GitHub', href: repoUrl },
];

export const footerColumns: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Playground', href: playgroundUrl },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Build',
    links: [
      { label: 'GitHub', href: repoUrl },
      { label: 'npm packages', href: npmUrl },
      { label: 'HTTP API', href: '/for-ai#http-api' },
    ],
  },
  {
    title: 'For AI',
    links: [
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'Writing guide', href: '/tosyn-guide.md' },
      { label: 'MCP server', href: mcpGuideUrl },
    ],
  },
];
