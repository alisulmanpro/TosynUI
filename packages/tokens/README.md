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

Variables are named from token paths (`color.surface-raised` → `--tosyn-color-surface-raised`) and
emitted in the `tosyn.tokens` cascade layer. Dark mode applies with `data-theme="dark"` or when
the operating system prefers it, unless `data-theme="light"` is set.

Supported types: `color` (sRGB), `dimension` (`px`, `rem`), `duration`, `fontFamily`,
`fontWeight`, `number` and `cubicBezier`. Tests hold both built-in themes to WCAG 2.2 AA contrast.
