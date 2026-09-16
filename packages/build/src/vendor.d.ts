declare module 'postcss-import' {
  import type { Plugin } from 'postcss';
  const postcssImport: (options?: Record<string, unknown>) => Plugin;
  export default postcssImport;
}
