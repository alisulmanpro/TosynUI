import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Tests run in Node, so `react-native` is replaced by a small stand-in made of plain components.
export default defineConfig({
  resolve: {
    alias: { 'react-native': fileURLToPath(new URL('./test/react-native.tsx', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: { include: ['src/**'], exclude: ['src/**/*.test.*'] },
  },
});
