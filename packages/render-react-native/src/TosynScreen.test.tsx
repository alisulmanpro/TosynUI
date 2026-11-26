import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseMarkup } from '@tosynui/parser';
import { checkDocument } from '@tosynui/rules';
import { TosynScreen, createTheme } from './index.js';
import type { TosynActionEvent, TosynScreenProps } from './index.js';
// The stand-in vitest swaps in for `react-native`; the same module instance, so the scheme is shared.
import { setColorScheme } from '../test/react-native.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const examples = new URL('../../../examples/', import.meta.url);

function documentFrom(markup: string) {
  const { document, diagnostics } = parseMarkup(markup);
  expect(diagnostics).toEqual([]);
  return document!;
}

const screen = (body: string) => `<screen name="demo" purpose="Test rendering.">${body}</screen>`;

let tree: ReactTestRenderer | undefined;

async function show(markup: string, props: Partial<TosynScreenProps> = {}) {
  await act(async () => {
    tree = create(createElement(TosynScreen, { document: documentFrom(markup), ...props }));
  });
  return tree!.root;
}

/** Instances of a stand-in component, such as `Text` or `TextInput`. */
const all = (root: ReactTestInstance, type: string) =>
  root.findAll((node) => (node.type as unknown) === type);

const texts = (root: ReactTestInstance) => all(root, 'Text').map((node) => node.children.join(''));

const find = (
  root: ReactTestInstance,
  type: string,
  predicate: (props: Record<string, unknown>) => boolean,
) => {
  const match = all(root, type).find((node) => predicate(node.props as Record<string, unknown>));
  if (!match) throw new Error(`No ${type} matched.`);
  return match;
};

const button = (root: ReactTestInstance, label: string) =>
  find(root, 'Pressable', (props) => props.accessibilityLabel === label);

const input = (root: ReactTestInstance, label: string) =>
  find(root, 'TextInput', (props) => String(props.accessibilityLabel).startsWith(label));

const style = (node: ReactTestInstance) => node.props.style as Record<string, unknown>;

beforeEach(() => setColorScheme('light'));
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
});

describe('TosynScreen', () => {
  it.each(['account-settings', 'bmi-calculator', 'sign-in'])(
    'renders the %s example, which passes every check',
    async (name) => {
      const markup = readFileSync(new URL(`${name}.tosyn`, examples), 'utf8');
      expect(checkDocument(documentFrom(markup)).valid).toBe(true);
      const root = await show(markup);
      expect(all(root, 'Text').length).toBeGreaterThan(3);
    },
  );

  it('derives heading levels from section depth', async () => {
    const root = await show(
      screen(
        '<section name="a"><heading>First</heading><section name="b"><heading>Nested</heading></section></section>' +
          '<section name="c"><heading>Second</heading></section>',
      ),
    );
    const size = (label: string) =>
      style(find(root, 'Text', (props) => (props.children as string) === label)).fontSize;
    expect(size('First')).toBe(34);
    expect(size('Nested')).toBe(26);
    expect(size('Second')).toBe(26);
    expect(all(root, 'Text').every((node) => node.props.accessibilityRole === 'header')).toBe(true);
  });

  it('styles emphasis and muted text from the tokens', async () => {
    const root = await show(
      screen(
        '<section name="a" emphasis="featured"><text tone="muted">Quiet</text></section>' +
          '<section name="b" emphasis="subdued"><text>Loud</text></section>',
      ),
    );
    const sections = all(root, 'View').filter((node) => 'borderRadius' in style(node));
    expect(style(sections[0]!)).toMatchObject({ backgroundColor: '#ffffff', padding: 24 });
    expect(style(sections[1]!)).toMatchObject({ backgroundColor: '#eef1f5' });
    expect(style(find(root, 'Text', (props) => props.children === 'Quiet'))).toMatchObject({
      color: '#4a5568',
      fontSize: 14,
    });
  });

  it('gives each field kind the right keyboard and labels it for screen readers', async () => {
    const root = await show(
      screen(
        '<section name="a">' +
          '<field name="w" label="Weight" kind="number" unit="kg" required hint="Whole kilos." />' +
          '<field name="e" label="Email" kind="email" />' +
          '<field name="p" label="Phone" kind="tel" />' +
          '<field name="s" label="Secret" kind="password" />' +
          '<field name="d" label="Born" kind="date" />' +
          '<field name="m" label="Notes" kind="multiline" />' +
          '</section>',
      ),
    );
    expect(input(root, 'Weight').props).toMatchObject({
      keyboardType: 'decimal-pad',
      accessibilityLabel: 'Weight, kg, required',
      accessibilityHint: 'Whole kilos.',
    });
    expect(input(root, 'Email').props).toMatchObject({
      keyboardType: 'email-address',
      autoCapitalize: 'none',
    });
    expect(input(root, 'Phone').props.keyboardType).toBe('phone-pad');
    expect(input(root, 'Secret').props).toMatchObject({
      secureTextEntry: true,
      autoCapitalize: 'none',
    });
    expect(input(root, 'Born').props.placeholder).toBe('YYYY-MM-DD');
    expect(input(root, 'Notes').props).toMatchObject({ multiline: true });
    expect(texts(root)).toContain('Whole kilos.');
  });

  it('shows a focus ring on the field being edited', async () => {
    const root = await show(screen('<section name="a"><field name="x" label="X" /></section>'));
    const control = () => all(root, 'View').find((node) => style(node).minHeight === 44)!;
    expect(style(control())).toMatchObject({ borderWidth: 1, borderColor: '#7a8599' });
    await act(async () => (input(root, 'X').props.onFocus as () => void)());
    expect(style(control())).toMatchObject({ borderWidth: 3, borderColor: '#2448d8' });
    await act(async () => (input(root, 'X').props.onBlur as () => void)());
    expect(style(control())).toMatchObject({ borderWidth: 1 });
  });

  it('keeps what the user types and reports it with the action', async () => {
    const onAction = vi.fn<(event: TosynActionEvent) => void>();
    const root = await show(
      screen(
        '<section name="a"><field name="height" label="Height" kind="number" />' +
          '<action intent="submit" importance="primary">Calculate</action></section>',
      ),
      { onAction },
    );
    await act(async () => (input(root, 'Height').props.onChangeText as (v: string) => void)('172'));
    expect(input(root, 'Height').props.value).toBe('172');
    await act(async () => (button(root, 'Calculate').props.onPress as () => void)());
    expect(onAction).toHaveBeenCalledWith({
      intent: 'submit',
      label: 'Calculate',
      values: { height: '172' },
    });
  });

  it('reveals after-submit messages on submit and hides them again on reset', async () => {
    const root = await show(
      screen(
        '<section name="a"><field name="q" label="Question" />' +
          '<feedback tone="success" when="after-submit">Sent</feedback>' +
          '<feedback tone="info">Always here</feedback>' +
          '<action intent="submit" importance="primary">Send</action>' +
          '<action intent="reset" importance="tertiary">Clear</action></section>',
      ),
    );
    expect(texts(root)).toContain('Always here');
    expect(texts(root)).not.toContain('Sent');

    await act(async () =>
      (input(root, 'Question').props.onChangeText as (v: string) => void)('hi'),
    );
    await act(async () => (button(root, 'Send').props.onPress as () => void)());
    expect(texts(root)).toContain('Sent');

    await act(async () => (button(root, 'Clear').props.onPress as () => void)());
    expect(texts(root)).not.toContain('Sent');
    expect(input(root, 'Question').props.value).toBe('');
  });

  it('announces feedback by tone', async () => {
    const root = await show(
      screen(
        '<section name="a"><feedback tone="error">Failed</feedback><feedback tone="success">Saved</feedback></section>',
      ),
    );
    const views = all(root, 'View').filter((node) => node.props.accessibilityLiveRegion);
    expect(views[0]!.props).toMatchObject({
      accessibilityRole: 'alert',
      accessibilityLiveRegion: 'assertive',
    });
    expect(views[1]!.props).toMatchObject({ accessibilityLiveRegion: 'polite' });
    const theme = createTheme('light');
    expect(style(views[0]!)).toMatchObject({
      backgroundColor: theme.color('danger-soft'),
      borderStartColor: theme.color('danger'),
    });
    expect(style(views[1]!).borderStartColor).toBe(theme.color('success'));
  });

  it('shows a result as a dash until the app supplies a value', async () => {
    const markup = screen(
      '<section name="a"><result name="size" label="Wire size" unit="mm²" /></section>',
    );
    const empty = await show(markup);
    const result = () => all(empty, 'View').find((node) => node.props.accessibilityLabel)!;
    expect(result().props.accessibilityLabel).toBe('Wire size: — mm²');
    expect(texts(empty)).toEqual(['Wire size', '—', 'mm²']);

    await act(async () => {
      tree!.update(
        createElement(TosynScreen, { document: documentFrom(markup), results: { size: '6' } }),
      );
    });
    expect(result().props.accessibilityLabel).toBe('Wire size: 6 mm²');
    expect(texts(empty)).toContain('6');
  });

  it('tells the app what was pressed, including navigate targets', async () => {
    const onAction = vi.fn<(event: TosynActionEvent) => void>();
    const root = await show(
      screen(
        '<section name="a"><action intent="navigate" target="/help">Help</action>' +
          '<action intent="delete">Delete it</action></section>',
      ),
      { onAction },
    );
    expect(button(root, 'Help').props.accessibilityRole).toBe('link');
    await act(async () => (button(root, 'Help').props.onPress as () => void)());
    await act(async () => (button(root, 'Delete it').props.onPress as () => void)());
    expect(onAction).toHaveBeenNthCalledWith(1, {
      intent: 'navigate',
      label: 'Help',
      target: '/help',
      values: {},
    });
    expect(onAction).toHaveBeenNthCalledWith(2, {
      intent: 'delete',
      label: 'Delete it',
      values: {},
    });
  });

  it('styles actions by importance and intent', async () => {
    const root = await show(
      screen(
        '<section name="a"><action intent="submit" importance="primary">Save</action>' +
          '<action intent="cancel">Discard</action>' +
          '<action intent="navigate" importance="tertiary" target="/x">More</action>' +
          '<action intent="delete">Remove</action></section>',
      ),
    );
    const look = (label: string) => style(button(root, label));
    expect(look('Save')).toMatchObject({ backgroundColor: '#2448d8', minHeight: 44 });
    expect(look('Discard')).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: '#2448d8',
    });
    expect(look('More')).toMatchObject({ borderColor: 'transparent' });
    expect(look('Remove').borderColor).not.toBe('#2448d8');
  });

  it('follows the colour scheme and brand', async () => {
    const markup = screen(
      '<section name="a"><action intent="submit" importance="primary">Go</action></section>',
    );
    const root = await show(markup, { scheme: 'dark', brand: 'ocean' });
    expect(style(button(root, 'Go')).backgroundColor).toBe('#5cc8f0');
    expect(style(all(root, 'ScrollView')[0]!).backgroundColor).toBe('#0f141f');

    await act(async () => {
      tree!.update(
        createElement(TosynScreen, {
          document: documentFrom(markup),
          scheme: 'light',
          brand: 'ocean',
        }),
      );
    });
    expect(style(button(root, 'Go')).backgroundColor).toBe('#006688');

    setColorScheme('dark');
    await act(async () => {
      tree!.update(createElement(TosynScreen, { document: documentFrom(markup) }));
    });
    expect(style(button(root, 'Go')).backgroundColor).toBe('#8ea6ff');
  });

  it('reports an unknown brand clearly', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(show(screen('<section name="a"></section>'), { brand: 'gold' })).rejects.toThrow(
      /Use one of: ocean, forest/,
    );
    quiet.mockRestore();
  });
});
