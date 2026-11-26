import {
  TokenError,
  baseTokens,
  brands as builtInBrands,
  cssValue,
  darkTokens,
  resolveTokens,
} from '@tosynui/tokens';
import type { Brand, ResolvedToken, TokenTree } from '@tosynui/tokens';

export type ColorScheme = 'light' | 'dark';

/** Pixels per `rem`. React Native has no `rem`, so token sizes are converted once here. */
const REM = 16;

type FontWeight = '400' | '500' | '600' | '700';

/** Theme values for one colour scheme, read by name from the tokens. */
export interface TosynTheme {
  scheme: ColorScheme;
  /** A colour token without its group, for example `accent` or `surface-raised`. */
  color(name: string): string;
  /** A spacing token in pixels, for example `sm`. */
  space(name: string): number;
  /** A corner radius token in pixels, for example `md`. */
  radius(name: string): number;
  /** A font size token in pixels, for example `2xl`. */
  fontSize(name: string): number;
  /** A font weight token, for example `semibold`. */
  fontWeight(name: string): FontWeight;
  /** A size token in pixels, for example `control`, `border` or `focus`. */
  size(name: string): number;
  /** A line height token as a multiple of the font size, for example `base`. */
  lineHeight(name: string): number;
}

function pixels(token: ResolvedToken): number {
  const { value, unit } = token.value as { value: number; unit: string };
  return unit === 'rem' ? value * REM : value;
}

/**
 * Builds the theme for a colour scheme from the default tokens, with an optional brand on top.
 * Colour, spacing and size values come from the same tokens as the HTML renderer, so a brand
 * looks the same on the web and on a phone.
 */
export function createTheme(
  scheme: ColorScheme,
  brand?: string,
  brands: Readonly<Record<string, Brand>> = builtInBrands,
): TosynTheme {
  let chosen: Brand | undefined;
  if (brand) {
    chosen = brands[brand];
    if (!chosen) {
      throw new TokenError(
        `Unknown brand "${brand}". Use one of: ${Object.keys(brands).join(', ')}.`,
      );
    }
  }
  const light: TokenTree[] = [baseTokens, ...(chosen?.light ?? [])];
  // Dark overrides come after the brand's light colours so a brand never leaks them into dark mode.
  const trees: TokenTree[] =
    scheme === 'dark' ? [...light, darkTokens, ...(chosen?.dark ?? [])] : light;
  const tokens = new Map(resolveTokens(...trees).map((token) => [token.name, token]));

  const need = (name: string, type: ResolvedToken['type']): ResolvedToken => {
    const token = tokens.get(name);
    if (!token || token.type !== type)
      throw new TokenError(`The theme has no ${type} token "${name}".`);
    return token;
  };

  return {
    scheme,
    color: (name) => cssValue(need(`color.${name}`, 'color')),
    space: (name) => pixels(need(`space.${name}`, 'dimension')),
    radius: (name) => pixels(need(`radius.${name}`, 'dimension')),
    fontSize: (name) => pixels(need(`font.size.${name}`, 'dimension')),
    fontWeight: (name) => String(need(`font.weight.${name}`, 'fontWeight').value) as FontWeight,
    size: (name) => pixels(need(`size.${name}`, 'dimension')),
    lineHeight: (name) => need(`font.line-height.${name}`, 'number').value as number,
  };
}

/** Adds transparency to a `#rrggbb` colour, for example for soft borders. */
export function withAlpha(color: string, alpha: number): string {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${channel}`;
}
