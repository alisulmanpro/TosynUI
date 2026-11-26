# @tosynui/tokens

The Tosyn default theme as design tokens in the
[W3C Design Tokens format 2025.10](https://www.designtokens.org/tr/2025.10/format/), and tools to
turn tokens into CSS.

```ts
import { resolveTokens, themeCss } from '@tosynui/tokens';

const css = themeCss(); // light theme, dark overrides and a prefers-color-scheme fallback
const tokens = resolveTokens(myBrandTokens); // merge, inherit types, follow aliases
```

- `base.tokens.json`: semantic colours, spacing, radii, sizes, typography and motion.
- `dark.tokens.json`: colour overrides for dark mode.

## Brand themes

A brand theme is a small tokens file that changes the default theme, usually only the accent
colours. `brands` holds two built in (`ocean`, `forest`). Make your own with a tokens file for
light mode and, if you want, one for dark mode:

```ts
import { brandCss } from '@tosynui/tokens';
import plum from './plum.tokens.json' with { type: 'json' };

const brand = { label: 'Plum', light: [plum] };
const css = brandCss('plum', brand); // add after themeCss()
```

Set `data-brand="plum"` on the element that has `data-tosyn`. With `renderPage` from
`@tosynui/render-html`, pass `brand: 'plum'` and `brands: { plum: brand }` and it does both. The CSS lists
only what the brand changes. A brand with no dark file keeps the default dark colours. Check your
brand colours against the contrast pairs in `tokens.test.ts`.

Variables are named from token paths (`color.surface-raised` → `--tosyn-color-surface-raised`) and
emitted in the `tosyn.tokens` cascade layer. Dark mode applies with `data-theme="dark"` or when
the operating system prefers it, unless `data-theme="light"` is set.

Supported types: `color` (sRGB), `dimension` (`px`, `rem`), `duration`, `fontFamily`,
`fontWeight`, `number` and `cubicBezier`. Tests hold both built-in themes to WCAG 2.2 AA contrast.
