# ADR 0002: Parser and token pipeline

- **Status:** Accepted
- **Date:** 2026-11-13
- **Amends:** [ADR 0001](0001-intent-first-architecture.md), technology table

## Context

ADR 0001 planned parse5 for the markup parser and Style Dictionary for tokens. Building the first
versions showed two problems with those choices.

1. **Self-closing tags.** parse5 follows the HTML specification, which ignores `/>` on elements
   that are not void elements. `<field ... />` would therefore swallow every following sibling.
   AI models write self-closing tags constantly, so this would be the most common failure.
2. **Web output only, for now.** The only renderer is HTML and CSS. Generating CSS custom
   properties from DTCG tokens is a small, well-defined task; Style Dictionary's value is its
   platform formats (Android, iOS, Flutter), which are not needed yet.

## Decision

- Use **htmlparser2** with `recognizeSelfClosing`. It accepts `<field ... />` and `<field></field>`
  alike, decodes entities, lower-cases names and reports implied closes, which the parser turns into
  `syntax-error` diagnostics with line and column.
- Generate CSS from tokens in **`@tosynui/tokens`** itself: merge trees, inherit `$type`, follow
  aliases, and emit variables in the `tosyn.tokens` layer. Tokens stay in the DTCG 2025.10 format,
  so Style Dictionary or Terrazzo can consume the same files when native platforms are added.
- Hold the built-in themes to **WCAG 2.2 AA contrast in tests**, and run **axe-core** on every
  rendered example in both themes in the end-to-end suite.

## Consequences

- The parser is not a conforming HTML parser. Tosyn markup is HTML-like, not HTML; the difference
  is documented in the parser README.
- Only sRGB colours and `px`/`rem` dimensions are supported for now. Wider colour spaces will need
  a fallback strategy before native platforms are added.
