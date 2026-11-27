import { brands } from '@tosynui/tokens';
import type { TokenTree } from '@tosynui/tokens';

export interface BrandSwatch {
  id: string;
  label: string;
  /** The brand's accent colour, as `#rrggbb`. */
  accent: string;
}

/** Finds `color.accent` in a tokens file. Later files in a brand win, so search from the end. */
function accentOf(trees: readonly TokenTree[]): string | undefined {
  for (const tree of [...trees].reverse()) {
    const color = tree.color as { accent?: { $value?: { hex?: string } } } | undefined;
    const hex = color?.accent?.$value?.hex;
    if (typeof hex === 'string') return hex;
  }
  return undefined;
}

/** The brands that ship in the library, with the accent colour each one sets. */
export function brandSwatches(): BrandSwatch[] {
  return Object.entries(brands).flatMap(([id, brand]) => {
    const accent = accentOf(brand.light);
    return accent ? [{ id, label: brand.label, accent }] : [];
  });
}
