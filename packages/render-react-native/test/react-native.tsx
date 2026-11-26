// A stand-in for `react-native` in Node tests: each component is a plain element that keeps its
// props, so tests can read styles and accessibility props and call handlers like onPress.
import { createElement } from 'react';
import type { ReactNode } from 'react';

type Props = Record<string, unknown> & { children?: ReactNode };

const host = (name: string) =>
  function Host({ children, ...props }: Props) {
    return createElement(name, props, children);
  };

export const View = host('View');
export const Text = host('Text');
export const TextInput = host('TextInput');
export const ScrollView = host('ScrollView');

/** Like the real Pressable, `style` may be a function of the pressed state. */
export function Pressable({ children, style, ...props }: Props) {
  const resolved =
    typeof style === 'function'
      ? (style as (s: { pressed: boolean }) => unknown)({ pressed: false })
      : style;
  return createElement('Pressable', { ...props, style: resolved }, children);
}

let scheme: 'light' | 'dark' | null = 'light';
export function setColorScheme(value: 'light' | 'dark' | null): void {
  scheme = value;
}
export function useColorScheme(): 'light' | 'dark' | null {
  return scheme;
}
