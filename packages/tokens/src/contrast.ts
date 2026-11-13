import type { ColorValue } from './resolve.js';

function channel(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of an sRGB color, as defined by WCAG 2.2. */
export function luminance(color: ColorValue): number {
  const [r = 0, g = 0, b = 0] = color.components.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio between two opaque sRGB colors, from 1 to 21. */
export function contrastRatio(a: ColorValue, b: ColorValue): number {
  const [light, darkest] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (darkest + 0.05);
}
