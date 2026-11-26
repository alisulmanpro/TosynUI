import { describe, expect, it } from 'vitest';
import { TokenError, brands } from '@tosynui/tokens';
import { createTheme, withAlpha } from './theme.js';

describe('createTheme', () => {
  it('converts token sizes to pixels', () => {
    const theme = createTheme('light');
    expect(theme.space('sm')).toBe(16);
    expect(theme.size('control')).toBe(44);
    expect(theme.size('border')).toBe(1);
    expect(theme.fontSize('2xl')).toBe(34);
    expect(theme.radius('md')).toBe(10);
    expect(theme.fontWeight('semibold')).toBe('600');
    expect(theme.lineHeight('base')).toBe(1.55);
  });

  it('uses the default light and dark colours', () => {
    expect(createTheme('light').color('accent')).toBe('#2448d8');
    expect(createTheme('dark').color('accent')).toBe('#8ea6ff');
    expect(createTheme('dark').color('surface')).toBe('#0f141f');
  });

  it('applies a brand in light and dark mode', () => {
    expect(createTheme('light', 'ocean').color('accent')).toBe('#006688');
    expect(createTheme('dark', 'ocean').color('accent')).toBe('#5cc8f0');
    expect(createTheme('light', 'ocean').color('focus')).toBe('#006688');
    expect(createTheme('light', 'ocean').space('sm')).toBe(16);
  });

  it('keeps the default dark colours when a brand has none, instead of leaking its light ones', () => {
    const light = brands.forest!.light;
    const theme = createTheme('dark', 'plain', { plain: { label: 'Plain', light } });
    expect(theme.color('accent')).toBe('#8ea6ff');
  });

  it('explains unknown brands and tokens', () => {
    expect(() => createTheme('light', 'gold')).toThrow(/Use one of: ocean, forest/);
    expect(() => createTheme('light').color('nope')).toThrow(TokenError);
    expect(() => createTheme('light').space('accent')).toThrow(/no dimension token/);
  });
});

describe('withAlpha', () => {
  it('adds an alpha channel to a hex colour', () => {
    expect(withAlpha('#7a8599', 0.45)).toBe('#7a859973');
    expect(withAlpha('#000000', 1)).toBe('#000000ff');
  });
});
