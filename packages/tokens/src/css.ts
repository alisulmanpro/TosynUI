import base from './tokens/base.tokens.json' with { type: 'json' };
import dark from './tokens/dark.tokens.json' with { type: 'json' };
import forest from './tokens/forest.tokens.json' with { type: 'json' };
import forestDark from './tokens/forest.dark.tokens.json' with { type: 'json' };
import ocean from './tokens/ocean.tokens.json' with { type: 'json' };
import oceanDark from './tokens/ocean.dark.tokens.json' with { type: 'json' };
import { TokenError, resolveTokens } from './resolve.js';
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

/**
 * A brand theme: token files that change the default theme, usually only the accent colours.
 * Anything a brand does not set comes from the default theme.
 */
export interface Brand {
  /** Name to show in a theme picker. */
  label: string;
  /** Token trees that override the default light theme. */
  light: TokenTree[];
  /** Token trees that override the default dark theme. Defaults to no changes. */
  dark?: TokenTree[];
}

/** The built-in brand themes, by name. */
export const brands: Readonly<Record<string, Brand>> = {
  ocean: { label: 'Ocean', light: [ocean], dark: [oceanDark] },
  forest: { label: 'Forest', light: [forest], dark: [forestDark] },
};

const BRAND_NAME = /^[a-z][a-z0-9-]*$/;

function valuesOf(trees: readonly TokenTree[]): Map<string, string> {
  return new Map(resolveTokens(...trees).map((token) => [token.name, cssValue(token)]));
}

/**
 * Generates the CSS that applies a brand theme to an element with `data-brand="<name>"`.
 *
 * It lists only the variables the brand changes, in light and dark mode, so it is small and
 * goes after `themeCss()`. A brand that sets no dark colours keeps the default dark theme.
 */
export function brandCss(name: string, brand: Brand, options: { scope?: string } = {}): string {
  if (!BRAND_NAME.test(name)) {
    throw new TokenError(`Brand name "${name}" must be kebab-case, for example "ocean".`);
  }
  const scope = `${options.scope ?? '[data-tosyn]'}[data-brand='${name}']`;

  const lightDefault = valuesOf([baseTokens]);
  const lightBrand = valuesOf([baseTokens, ...brand.light]);
  const darkDefault = valuesOf([baseTokens, darkTokens]);
  // Dark overrides come after the brand's light colours so a brand never leaks its light accent
  // into dark mode.
  const darkBrand = valuesOf([baseTokens, ...brand.light, darkTokens, ...(brand.dark ?? [])]);

  const lightChanged = [...lightBrand].filter(([key, value]) => lightDefault.get(key) !== value);
  const lightChangedNames = new Set(lightChanged.map(([key]) => key));
  const darkChanged = [...darkBrand].filter(
    ([key, value]) =>
      value !== (lightChangedNames.has(key) ? lightBrand.get(key) : darkDefault.get(key)),
  );

  const lines = (entries: [string, string][], indent: string): string =>
    entries.map(([key, value]) => `${indent}${cssVariable(key)}: ${value};`).join('\n');

  let css = `@layer tosyn.tokens {\n:where(${scope}) {\n${lines(lightChanged, '  ')}\n}\n`;
  if (darkChanged.length > 0) {
    css +=
      `:where(${scope}[data-theme='dark']) {\n${lines(darkChanged, '  ')}\n}\n` +
      `@media (prefers-color-scheme: dark) {\n  :where(${scope}:not([data-theme='light'])) {\n${lines(darkChanged, '    ')}\n  }\n}\n`;
  }
  return `${css}}\n`;
}
