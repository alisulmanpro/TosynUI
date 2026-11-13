import { describe, expect, it } from 'vitest';
import {
  TokenError,
  baseTokens,
  contrastRatio,
  cssValue,
  cssVariable,
  darkTokens,
  resolveTokens,
  themeCss,
} from './index.js';
import type { ColorValue } from './index.js';

function srgb(hex: string): ColorValue {
  const components = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  return { colorSpace: 'srgb', components, hex };
}

describe('resolveTokens', () => {
  it('inherits group types and follows aliases', () => {
    const tokens = resolveTokens({
      color: {
        $type: 'color',
        brand: { $value: srgb('#2448d8'), $description: 'Brand.' },
        link: { $value: '{color.brand}' },
      },
    });
    expect(tokens.map((token) => [token.name, token.type])).toEqual([
      ['color.brand', 'color'],
      ['color.link', 'color'],
    ]);
    expect(tokens[1]?.value).toEqual(tokens[0]?.value);
    expect(tokens[0]?.description).toBe('Brand.');
  });

  it('lets later trees override earlier ones, including alias targets', () => {
    const tokens = resolveTokens(
      { color: { $type: 'color', a: { $value: srgb('#000000') }, b: { $value: '{color.a}' } } },
      { color: { a: { $value: srgb('#ffffff') } } },
    );
    expect(tokens.map(cssValue)).toEqual(['#ffffff', '#ffffff']);
  });

  it.each([
    [{ a: { $value: '{b}' }, b: { $value: '{a}' } }, /Circular alias/],
    [{ a: { $value: '{missing}' } }, /does not point to a token/],
    [{ a: { $value: 1 } }, /has no \$type/],
    [{ a: { $type: 'gradient', $value: [] } }, /unsupported \$type/],
    [{ a: { $type: 'dimension', $value: { value: 1, unit: 'em' } } }, /unit px or rem/],
    [{ a: { $type: 'color', $value: '#fff' } }, /color object/],
    [{ a: { $type: 'color', $value: { colorSpace: 'oklch', components: [1, 0, 0] } } }, /srgb/],
    [{ a: { $type: 'fontWeight', $value: 1200 } }, /1 to 1000/],
    [{ a: { $type: 'cubicBezier', $value: [0, 1] } }, /four numbers/],
    [{ a: 'loose' }, /group or a token/],
    [
      { a: { $type: 'number', $value: 1 }, b: { $type: 'color', $value: '{a}' } },
      /aliases a, which is number/,
    ],
  ])('rejects %j', (tree, message) => {
    expect(() => resolveTokens(tree)).toThrow(TokenError);
    expect(() => resolveTokens(tree)).toThrow(message);
  });
});

describe('CSS output', () => {
  it('names variables from token paths', () => {
    expect(cssVariable('color.surface-raised')).toBe('--tosyn-color-surface-raised');
  });

  it('formats every token type', () => {
    const values = Object.fromEntries(
      resolveTokens(baseTokens).map((token) => [token.name, cssValue(token)]),
    );
    expect(values).toMatchObject({
      'color.accent': '#2448d8',
      'color.focus': '#2448d8',
      'space.sm': '1rem',
      'size.border': '1px',
      'motion.duration.fast': '120ms',
      'motion.easing.standard': 'cubic-bezier(0.2, 0, 0, 1)',
      'font.family.base': '"Inter", ui-sans-serif, system-ui, sans-serif',
      'font.weight.semibold': '600',
      'font.line-height.base': '1.55',
    });
  });

  it('formats translucent colors', () => {
    const [token] = resolveTokens({
      a: { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 0, 0], alpha: 0.5 } },
    });
    expect(cssValue(token!)).toBe('rgb(255 0 0 / 0.5)');
  });

  it('emits light variables, dark overrides and a system preference fallback', () => {
    const css = themeCss();
    expect(css).toContain('@layer tosyn.tokens');
    expect(css).toContain(':where([data-tosyn]) {');
    expect(css).toContain("[data-theme='dark']");
    expect(css).toContain('prefers-color-scheme: dark');
    const darkBlock = css.slice(css.indexOf("[data-theme='dark']"));
    expect(darkBlock).toContain('--tosyn-color-focus: #8ea6ff;');
    expect(darkBlock).not.toContain('--tosyn-space-sm');
  });

  it('can scope variables and omit the dark theme', () => {
    const css = themeCss({ scope: '.app', dark: [] });
    expect(css).toContain(':where(.app) {');
    expect(css).not.toContain("data-theme='dark'");
    expect(css).not.toContain('prefers-color-scheme');
  });
});

describe('built-in themes meet WCAG 2.2 AA contrast', () => {
  const text: [string, string][] = [
    ['ink', 'surface'],
    ['ink', 'surface-raised'],
    ['ink', 'surface-sunken'],
    ['ink-muted', 'surface'],
    ['ink-muted', 'surface-raised'],
    ['ink-muted', 'surface-sunken'],
    ['accent', 'surface'],
    ['accent', 'surface-raised'],
    ['accent', 'surface-sunken'],
    ['accent-ink', 'accent'],
    ['danger', 'surface-raised'],
    ['danger', 'surface-sunken'],
    ['info', 'info-soft'],
    ['success', 'success-soft'],
    ['warning', 'warning-soft'],
    ['danger', 'danger-soft'],
  ];
  const nonText: [string, string][] = [
    ['outline', 'surface'],
    ['outline', 'surface-raised'],
    ['outline', 'surface-sunken'],
    ['focus', 'surface'],
    ['focus', 'surface-raised'],
    ['focus', 'surface-sunken'],
  ];

  for (const [theme, trees] of [
    ['light', [baseTokens]],
    ['dark', [baseTokens, darkTokens]],
  ] as const) {
    const colors = new Map(
      resolveTokens(...trees)
        .filter((token) => token.type === 'color')
        .map((token) => [token.name.replace('color.', ''), token.value as ColorValue]),
    );
    const ratio = (a: string, b: string) => contrastRatio(colors.get(a)!, colors.get(b)!);

    it.each(text)(`${theme}: %s on %s is at least 4.5:1`, (foreground, background) => {
      expect(ratio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(nonText)(`${theme}: %s against %s is at least 3:1`, (foreground, background) => {
      expect(ratio(foreground, background)).toBeGreaterThanOrEqual(3);
    });
  }

  it('computes known ratios', () => {
    expect(contrastRatio(srgb('#000000'), srgb('#ffffff'))).toBeCloseTo(21, 5);
    expect(contrastRatio(srgb('#777777'), srgb('#777777'))).toBe(1);
  });
});
