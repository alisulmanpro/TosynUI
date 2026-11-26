# @tosynui/render-react-native

Renders a Tosyn document as a React Native screen. It reads the same tokens as the HTML renderer,
so a brand looks the same on the web and on a phone. Works in Expo and in plain React Native.

```tsx
import { parseMarkup } from '@tosynui/parser';
import { TosynScreen } from '@tosynui/render-react-native';

const { document } = parseMarkup(markup); // check it first with @tosynui/rules

export function BmiScreen() {
  const [results, setResults] = useState({});
  return (
    <TosynScreen
      document={document!}
      scheme="system" // or "light" / "dark"
      brand="ocean" // optional; also "forest", or your own via `brands`
      results={results}
      onAction={(event) => {
        if (event.intent === 'submit') setResults({ bmi: calculate(event.values) });
      }}
    />
  );
}
```

## What it does for you

- **Layout and look** come from tokens: spacing, colours, sizes, light and dark, brands.
- **Heading levels** come from section depth, as in HTML.
- **Fields** get the right keyboard (`number`, `email`, `tel`, `password`), keep what the user
  types, and are labelled for screen readers with their unit and whether they are required.
- **Feedback** is announced. `when="after-submit"` messages appear once a submit action is pressed
  and disappear again on reset.
- **Results** show a dash until you pass a value in `results`.
- **Actions** call `onAction` with `{ intent, label, target?, values }`. Saving, navigating,
  deleting and calculating are yours to do there; Tosyn only describes the screen.

## Good to know

- Text uses the phone's system font. The `Inter` font in the tokens is not loaded for you.
- Date fields are plain text with a `YYYY-MM-DD` hint; there is no date picker yet.
- Required fields are marked and announced, but not checked. Check `values` in `onAction`.
- Peer dependencies: `react` 18.2 or newer and `react-native` 0.76 or newer. Tested with
  React Native 0.88 (Expo SDK 58).

The tests run in Node against a small stand-in for `react-native`, so they check structure, styles,
accessibility props and behaviour. Try the demo on a device before you rely on the exact look.
