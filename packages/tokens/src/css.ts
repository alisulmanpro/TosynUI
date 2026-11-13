import base from './tokens/base.tokens.json' with { type: 'json' };
import dark from './tokens/dark.tokens.json' with { type: 'json' };
import { resolveTokens } from './resolve.js';
import type { ColorValue, ResolvedToken, TokenTree, UnitValue } from './resolve.js';

/** The default theme, in DTCG format. */
export const baseTokens: TokenTree = base;
/** Overrides applied on top of the default theme for dark mode. */
export const darkTokens: TokenTree = dark;

/** Prefix of every CSS custom property generated from tokens. */
export const CSS_PREFIX = '--tosyn';

const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  'ui-rounded',
]);

/** `color.surface-raised` → `--tosyn-color-surface-raised`. */
export function cssVariable(name: string): string {
  return `${CSS_PREFIX}-${name.replaceAll('.', '-')}`;
}

/** Converts a resolved token value to CSS. */
export function cssValue(token: ResolvedToken): string {
  switch (token.type) {
    case 'color': {
      const color = token.value as ColorValue;
      const [r = 0, g = 0, b = 0] = color.components.map((component) =>
        Math.round(component * 255),
      );
      const alpha = color.alpha ?? 1;
      if (alpha < 1) return `rgb(${r} ${g} ${b} / ${alpha})`;
      return (
        color.hex?.toLowerCase() ??
        `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`
      );
    }
    case 'dimension':
    case 'duration': {
      const { value, unit } = token.value as UnitValue;
      return `${value}${unit}`;
    }
    case 'fontFamily': {
      const families = Array.isArray(token.value)
        ? (token.value as string[])
        : [token.value as string];
      return families
        .map((family) => (GENERIC_FAMILIES.has(family) ? family : JSON.stringify(family)))
        .join(', ');
    }
    case 'cubicBezier':
      return `cubic-bezier(${(token.value as number[]).join(', ')})`;
    case 'fontWeight':
    case 'number':
      return String(token.value);
  }
}

function declarations(tokens: readonly ResolvedToken[]): string {
  return tokens.map((token) => `  ${cssVariable(token.name)}: ${cssValue(token)};`).join('\n');
}

export interface ThemeCssOptions {
  /** Selector that receives the variables. Defaults to `[data-tosyn]`. */
  scope?: string;
  /** Token trees for the light theme. Defaults to the built-in theme. */
  light?: TokenTree[];
  /** Overrides for the dark theme. Defaults to the built-in dark overrides. Pass `[]` to omit. */
  dark?: TokenTree[];
}

/**
 * Generates CSS custom properties for the light theme and, when overrides exist, a dark theme.
 * Dark mode applies with `data-theme="dark"` or follows the operating system unless the
 * element has `data-theme="light"`.
 */
export function themeCss(options: ThemeCssOptions = {}): string {
  const scope = options.scope ?? '[data-tosyn]';
  const lightTrees = options.light ?? [baseTokens];
  const darkTrees = options.dark ?? [darkTokens];
  const light = resolveTokens(...lightTrees);

  let css = `@layer tosyn.tokens {\n:where(${scope}) {\n  color-scheme: light dark;\n${declarations(light)}\n}\n`;
  if (darkTrees.length > 0) {
    const lightValues = new Map(light.map((token) => [token.name, cssValue(token)]));
    const changed = resolveTokens(...lightTrees, ...darkTrees).filter(
      (token) => lightValues.get(token.name) !== cssValue(token),
    );
    const body = declarations(changed);
    css +=
      `:where(${scope}[data-theme='light']) {\n  color-scheme: light;\n}\n` +
      `:where(${scope}[data-theme='dark']) {\n  color-scheme: dark;\n${body}\n}\n` +
      `@media (prefers-color-scheme: dark) {\n  :where(${scope}:not([data-theme='light'])) {\n${body
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')}\n  }\n}\n`;
  }
  return `${css}}\n`;
}
