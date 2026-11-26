import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useColorScheme } from 'react-native';
import type { KeyboardTypeOptions, TextStyle } from 'react-native';
import type { AttributeValue, ElementNode, TosynDocument, TosynNode } from '@tosynui/spec';
import type { Brand } from '@tosynui/tokens';
import { createTheme, withAlpha } from './theme.js';
import type { ColorScheme, TosynTheme } from './theme.js';

/** What happened when the user pressed an action. */
export interface TosynActionEvent {
  intent: 'submit' | 'navigate' | 'reset' | 'cancel' | 'delete';
  /** The action's label. */
  label: string;
  /** Where a `navigate` action goes. */
  target?: string;
  /** What the user has typed, by field `name`. Empty after a reset. */
  values: Record<string, string>;
}

export interface TosynScreenProps {
  /** A valid document, for example from `parseMarkup` in `@tosynui/parser`. */
  document: TosynDocument;
  /** `system` follows the phone's setting. Defaults to `system`. */
  scheme?: ColorScheme | 'system';
  /** Name of a brand theme, such as `ocean`. Leave out for the default theme. */
  brand?: string;
  /** Brand themes to choose from. Defaults to the built-in brands. */
  brands?: Readonly<Record<string, Brand>>;
  /** Values for `<result>` elements, by `name`. A result with no value shows a dash. */
  results?: Readonly<Record<string, string>>;
  /** Called after every action. Do the real work here: save, navigate, delete, calculate. */
  onAction?: (event: TosynActionEvent) => void;
}

interface ScreenState {
  theme: TosynTheme;
  values: Record<string, string>;
  setValue(name: string, value: string): void;
  /** True once the user has pressed a submit action, which reveals `after-submit` messages. */
  submitted: boolean;
  results: Readonly<Record<string, string>>;
  press(action: ElementNode): void;
}

const State = createContext<ScreenState | undefined>(undefined);

function useScreen(): ScreenState {
  const state = useContext(State);
  if (!state) throw new Error('Tosyn components must be rendered inside <TosynScreen>.');
  return state;
}

function attribute(node: ElementNode, name: string): AttributeValue | undefined {
  return node.attributes?.[name];
}

function stringAttribute(node: ElementNode, name: string, fallback: string): string;
function stringAttribute(node: ElementNode, name: string): string | undefined;
function stringAttribute(node: ElementNode, name: string, fallback?: string): string | undefined {
  const value = attribute(node, name);
  return typeof value === 'string' ? value : fallback;
}

function elementChildren(node: ElementNode): ElementNode[] {
  return (node.children ?? []).filter((child): child is ElementNode => 'element' in child);
}

function textOf(node: ElementNode): string {
  return (node.children ?? [])
    .map((child: TosynNode) => ('text' in child ? child.text : ''))
    .join('')
    .trim();
}

/**
 * Renders a valid Tosyn document as a React Native screen.
 *
 * It uses the same tokens and the same rules as the HTML renderer: heading levels come from
 * section depth, fields are labelled for screen readers, and feedback is announced. The screen
 * keeps what the user types and reveals `after-submit` messages once a submit action is pressed.
 * Real work happens in `onAction`.
 */
export function TosynScreen(props: TosynScreenProps): ReactElement {
  const { document, scheme = 'system', brand, brands, results = {}, onAction } = props;
  const system = useColorScheme();
  const resolved: ColorScheme =
    scheme === 'system' ? (system === 'dark' ? 'dark' : 'light') : scheme;
  const theme = useMemo(() => createTheme(resolved, brand, brands), [resolved, brand, brands]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const state: ScreenState = {
    theme,
    values,
    setValue: (name, value) => setValues((current) => ({ ...current, [name]: value })),
    submitted,
    results,
    press: (action) => {
      const intent = stringAttribute(action, 'intent', 'submit') as TosynActionEvent['intent'];
      const target = stringAttribute(action, 'target');
      let reported = values;
      if (intent === 'submit') setSubmitted(true);
      if (intent === 'reset') {
        setValues({});
        setSubmitted(false);
        reported = {};
      }
      onAction?.({
        intent,
        label: textOf(action),
        ...(target ? { target } : {}),
        values: reported,
      });
    },
  };

  const sections = elementChildren(document.root);
  return (
    <State.Provider value={state}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.color('surface') }}
        contentContainerStyle={{
          alignSelf: 'center',
          width: '100%',
          maxWidth: theme.size('screen'),
          padding: theme.space('sm'),
          paddingVertical: theme.space('lg'),
          gap: theme.space('lg'),
        }}
        keyboardShouldPersistTaps="handled"
      >
        {sections.map((section, index) => (
          <Section key={index} node={section} depth={1} offset={index === 0 ? 0 : 1} />
        ))}
      </ScrollView>
    </State.Provider>
  );
}

function Section({ node, depth, offset }: { node: ElementNode; depth: number; offset: number }) {
  const { theme } = useScreen();
  const emphasis = stringAttribute(node, 'emphasis', 'default');
  const children = elementChildren(node);

  const content: ReactElement[] = [];
  let actions: ElementNode[] = [];
  const flush = (key: string): void => {
    if (actions.length === 0) return;
    const group = actions;
    actions = [];
    content.push(
      <View
        key={key}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: theme.space('2xs'),
          paddingTop: theme.space('3xs'),
        }}
      >
        {group.map((action, index) => (
          <Action key={index} node={action} />
        ))}
      </View>,
    );
  };

  children.forEach((child, index) => {
    if (child.element === 'action') {
      actions.push(child);
      return;
    }
    flush(`actions-before-${index}`);
    switch (child.element) {
      case 'heading':
        content.push(<Heading key={index} node={child} level={Math.min(depth + offset, 6)} />);
        break;
      case 'text':
        content.push(<Paragraph key={index} node={child} />);
        break;
      case 'field':
        content.push(<Field key={index} node={child} />);
        break;
      case 'feedback':
        content.push(<Feedback key={index} node={child} />);
        break;
      case 'result':
        content.push(<Result key={index} node={child} />);
        break;
      case 'section':
        content.push(<Section key={index} node={child} depth={depth + 1} offset={offset} />);
        break;
    }
  });
  flush('actions-end');

  const boxed = emphasis === 'featured' || emphasis === 'subdued';
  return (
    <View
      style={{
        gap: theme.space('sm'),
        ...(boxed ? { padding: theme.space('md'), borderRadius: theme.radius('lg') } : {}),
        ...(emphasis === 'featured'
          ? {
              borderWidth: theme.size('border'),
              borderColor: withAlpha(theme.color('outline'), 0.45),
              backgroundColor: theme.color('surface-raised'),
            }
          : {}),
        ...(emphasis === 'subdued' ? { backgroundColor: theme.color('surface-sunken') } : {}),
      }}
    >
      {content}
    </View>
  );
}

function Heading({ node, level }: { node: ElementNode; level: number }) {
  const { theme } = useScreen();
  const size = level === 1 ? '2xl' : level === 2 ? 'xl' : level === 3 ? 'lg' : 'md';
  const fontSize = theme.fontSize(size);
  return (
    <Text
      accessibilityRole="header"
      style={{
        color: theme.color('ink'),
        fontSize,
        fontWeight: theme.fontWeight(level === 1 ? 'bold' : 'semibold'),
        lineHeight: fontSize * theme.lineHeight('tight'),
      }}
    >
      {textOf(node)}
    </Text>
  );
}

function Paragraph({ node }: { node: ElementNode }) {
  const { theme } = useScreen();
  const muted = stringAttribute(node, 'tone', 'default') === 'muted';
  const fontSize = theme.fontSize(muted ? 'sm' : 'md');
  return (
    <Text
      style={{
        color: theme.color(muted ? 'ink-muted' : 'ink'),
        fontSize,
        lineHeight: fontSize * theme.lineHeight('base'),
      }}
    >
      {textOf(node)}
    </Text>
  );
}

const KEYBOARD: Record<string, KeyboardTypeOptions> = {
  number: 'decimal-pad',
  email: 'email-address',
  tel: 'phone-pad',
};

function Field({ node }: { node: ElementNode }) {
  const { theme, values, setValue } = useScreen();
  const [focused, setFocused] = useState(false);
  const name = stringAttribute(node, 'name', 'field');
  const kind = stringAttribute(node, 'kind', 'text');
  const label = stringAttribute(node, 'label', name);
  const hint = stringAttribute(node, 'hint');
  const unit = stringAttribute(node, 'unit');
  const required = attribute(node, 'required') === true;
  const multiline = kind === 'multiline';
  const fontSize = theme.fontSize('md');
  const small = theme.fontSize('sm');

  const screenReaderLabel = [label, unit, required ? 'required' : undefined]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={{ gap: theme.space('3xs') }}>
      <Text
        style={{
          color: theme.color('ink'),
          fontSize,
          fontWeight: theme.fontWeight('medium'),
        }}
      >
        {label}
        {required ? (
          <Text accessible={false} style={{ color: theme.color('danger') }}>
            {' *'}
          </Text>
        ) : null}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          minHeight: theme.size('control'),
          overflow: 'hidden',
          borderWidth: focused ? theme.size('focus') : theme.size('border'),
          borderColor: focused ? theme.color('focus') : theme.color('outline'),
          borderRadius: theme.radius('md'),
          backgroundColor: theme.color('surface-raised'),
        }}
      >
        <TextInput
          accessibilityLabel={screenReaderLabel}
          {...(hint ? { accessibilityHint: hint } : {})}
          value={values[name] ?? ''}
          onChangeText={(value) => setValue(name, value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={KEYBOARD[kind] ?? 'default'}
          autoCapitalize={kind === 'email' || kind === 'password' ? 'none' : 'sentences'}
          autoCorrect={kind === 'text' || kind === 'multiline'}
          secureTextEntry={kind === 'password'}
          multiline={multiline}
          {...(kind === 'date' ? { placeholder: 'YYYY-MM-DD' } : {})}
          placeholderTextColor={theme.color('ink-muted')}
          style={{
            flex: 1,
            minWidth: 0,
            paddingHorizontal: theme.space('xs'),
            paddingVertical: multiline ? theme.space('2xs') : 0,
            minHeight: multiline ? 96 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
            color: theme.color('ink'),
            fontSize,
          }}
        />
        {unit ? (
          <View
            style={{
              justifyContent: 'center',
              paddingHorizontal: theme.space('xs'),
              borderStartWidth: theme.size('border'),
              borderStartColor: withAlpha(theme.color('outline'), 0.45),
              backgroundColor: theme.color('surface-sunken'),
            }}
          >
            <Text accessible={false} style={{ color: theme.color('ink-muted'), fontSize: small }}>
              {unit}
            </Text>
          </View>
        ) : null}
      </View>
      {hint ? (
        <Text style={{ color: theme.color('ink-muted'), fontSize: small }}>{hint}</Text>
      ) : null}
    </View>
  );
}

function Action({ node }: { node: ElementNode }) {
  const { theme, press } = useScreen();
  const intent = stringAttribute(node, 'intent', 'submit');
  const importance = stringAttribute(node, 'importance', 'secondary');
  const label = textOf(node);

  const tone = intent === 'delete' ? 'danger' : 'accent';
  const filled = importance === 'primary';
  const plain = importance === 'tertiary';
  const textColor = filled
    ? theme.color(intent === 'delete' ? 'surface-raised' : 'accent-ink')
    : theme.color(tone);
  const textStyle: TextStyle = {
    color: textColor,
    fontSize: theme.fontSize('md'),
    fontWeight: theme.fontWeight('semibold'),
    ...(plain ? { textDecorationLine: 'underline' } : {}),
  };

  return (
    <Pressable
      accessibilityRole={intent === 'navigate' ? 'link' : 'button'}
      accessibilityLabel={label}
      onPress={() => press(node)}
      style={({ pressed }) => ({
        minHeight: theme.size('control'),
        paddingHorizontal: plain ? theme.space('2xs') : theme.space('sm'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: theme.size('border'),
        borderColor: plain ? 'transparent' : theme.color(tone),
        borderRadius: theme.radius('md'),
        backgroundColor: filled
          ? theme.color(tone)
          : pressed && !plain
            ? theme.color(intent === 'delete' ? 'danger-soft' : 'accent-soft')
            : 'transparent',
        opacity: pressed && (filled || plain) ? 0.85 : 1,
      })}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

function Feedback({ node }: { node: ElementNode }) {
  const { theme, submitted } = useScreen();
  const tone = stringAttribute(node, 'tone', 'info');
  if (stringAttribute(node, 'when', 'always') === 'after-submit' && !submitted) return null;

  const color = theme.color(tone === 'error' ? 'danger' : tone);
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
      style={{
        paddingVertical: theme.space('xs') / 1.5,
        paddingHorizontal: theme.space('xs'),
        borderStartWidth: 4,
        borderStartColor: color,
        borderRadius: theme.radius('md'),
        backgroundColor: theme.color(`${tone === 'error' ? 'danger' : tone}-soft`),
      }}
    >
      <Text
        style={{ color, fontSize: theme.fontSize('md'), fontWeight: theme.fontWeight('medium') }}
      >
        {textOf(node)}
      </Text>
    </View>
  );
}

/** Shows the value the app gives for this result, or a dash while there is none. */
function Result({ node }: { node: ElementNode }) {
  const { theme, results } = useScreen();
  const name = stringAttribute(node, 'name', 'result');
  const label = stringAttribute(node, 'label', name);
  const unit = stringAttribute(node, 'unit');
  const value = results[name] ?? '—';

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
      accessibilityLiveRegion="polite"
      style={{ gap: theme.space('3xs') }}
    >
      <Text
        style={{
          color: theme.color('ink'),
          fontSize: theme.fontSize('md'),
          fontWeight: theme.fontWeight('medium'),
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.space('2xs') }}>
        <Text
          style={{
            color: theme.color('ink'),
            fontSize: theme.fontSize('xl'),
            fontWeight: theme.fontWeight('semibold'),
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={{ color: theme.color('ink-muted'), fontSize: theme.fontSize('sm') }}>
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
