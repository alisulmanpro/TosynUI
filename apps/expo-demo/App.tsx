import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { parseMarkup } from '@tosynui/parser';
import { TosynScreen, brands } from '@tosynui/render-react-native';
import type { TosynActionEvent } from '@tosynui/render-react-native';
import { examples } from './src/examples.generated';

type Scheme = 'system' | 'light' | 'dark';

const SCHEMES: Scheme[] = ['system', 'light', 'dark'];
const EXAMPLE_NAMES = Object.keys(examples);

/** The work behind the BMI screen. Tosyn describes the screen; the app does the calculating. */
function calculateBmi(values: Record<string, string>): string | undefined {
  const height = Number.parseFloat(values.height ?? '');
  const weight = Number.parseFloat(values.weight ?? '');
  if (!(height > 0) || !(weight > 0)) return undefined;
  return (weight / (height / 100) ** 2).toFixed(1);
}

export default function App(): ReactElement {
  const [name, setName] = useState('bmi-calculator');
  const [scheme, setScheme] = useState<Scheme>('system');
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<Record<string, string>>({});
  const [last, setLast] = useState('Press an action to see what the app receives.');

  const document = useMemo(() => parseMarkup(examples[name] ?? '').document, [name]);

  function onAction(event: TosynActionEvent): void {
    setLast(`${event.intent}: ${event.label} ${JSON.stringify(event.values)}`);
    if (name === 'bmi-calculator') {
      if (event.intent === 'submit') {
        const bmi = calculateBmi(event.values);
        if (bmi) setResults({ bmi });
      } else if (event.intent === 'reset') {
        setResults({});
      }
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      <View style={styles.bar}>
        <Text style={styles.title}>Tosyn on React Native</Text>
        <Chips
          label="Screen"
          options={EXAMPLE_NAMES.map((value) => [value, value])}
          selected={name}
          onSelect={(value) => {
            setName(value);
            setResults({});
          }}
        />
        <Chips
          label="Mode"
          options={SCHEMES.map((value) => [value, value])}
          selected={scheme}
          onSelect={(value) => setScheme(value as Scheme)}
        />
        <Chips
          label="Brand"
          options={[
            ['', 'default'],
            ...Object.entries(brands).map(
              ([key, { label }]) => [key, label.toLowerCase()] as [string, string],
            ),
          ]}
          selected={brand ?? ''}
          onSelect={(value) => setBrand(value || undefined)}
        />
      </View>
      {document ? (
        // `key` gives each screen its own typed values.
        <TosynScreen
          key={name}
          document={document}
          scheme={scheme}
          {...(brand ? { brand } : {})}
          results={results}
          onAction={onAction}
        />
      ) : null}
      <Text style={styles.footer} accessibilityLiveRegion="polite">
        {last}
      </Text>
    </View>
  );
}

function Chips(props: {
  label: string;
  options: [string, string][];
  selected: string;
  onSelect(value: string): void;
}): ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{props.label}</Text>
      {props.options.map(([value, text]) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: props.selected === value }}
          onPress={() => props.onSelect(value)}
          style={[styles.chip, props.selected === value && styles.chipOn]}
        >
          <Text style={[styles.chipText, props.selected === value && styles.chipTextOn]}>
            {text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// The demo chrome is plain React Native; everything below it is rendered by Tosyn.
const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 48, backgroundColor: '#ffffff' },
  bar: { gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#141b2d' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  rowLabel: { width: 52, fontSize: 12, color: '#4a5568' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7a8599',
  },
  chipOn: { backgroundColor: '#141b2d', borderColor: '#141b2d' },
  chipText: { fontSize: 12, color: '#141b2d' },
  chipTextOn: { color: '#ffffff' },
  footer: { padding: 8, fontSize: 12, color: '#4a5568', backgroundColor: '#eef1f5' },
});
