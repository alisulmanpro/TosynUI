# Tosyn

Tosyn is an intent language for user interfaces, designed to be written by AI models and read by
people.

A Tosyn document describes what each part of a screen does and how important it is. It never
describes how it looks. Design rules and renderers turn the same document into a consistent,
accessible result, so visual decisions live in one place instead of being re-made, and drifting, on
every screen.

```html
<screen name="bmi-calculator" purpose="Work out body mass index from height and weight.">
  <section name="inputs" emphasis="featured">
    <heading>BMI calculator</heading>
    <field name="height" label="Height" kind="number" unit="cm" required />
    <field name="weight" label="Weight" kind="number" unit="kg" required />
    <action intent="submit" importance="primary">Calculate BMI</action>
  </section>
</screen>
```

There are no classes, colours or sizes in that markup, and there cannot be: the validator rejects
them. The renderer produces native HTML with derived heading levels, labelled inputs, a form, and
styles from design tokens, in light or dark mode.

> **Status: v0.1, early.** The language has seven elements. Everything below works and is tested,
> but the vocabulary is deliberately small; see [Testing with AI](docs/testing-with-ai.md) for how
> to find out what to add next. Design decisions are recorded in [docs/adr](docs/adr).

## How it fits together

```text
markup ──parser──▶ IR (JSON) ──spec validator──▶ design rules ──▶ renderer ──▶ HTML + CSS
                                                                     ▲
                                                         design tokens (DTCG)
```

| Package                | What it does                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- |
| `@tosynui/spec`        | Element catalog, JSON Schemas and validator: "is this valid Tosyn?"           |
| `@tosynui/parser`      | Markup → JSON intermediate representation, with line and column positions     |
| `@tosynui/rules`       | Eleven design rules and `checkDocument`: "is this good design?"               |
| `@tosynui/tokens`      | Default theme in the W3C DTCG format, light and dark, WCAG AA contrast tested |
| `@tosynui/render-html` | Accessible HTML and zero-specificity CSS                                      |
| `@tosynui/ai`          | Generated guide that teaches AI models to write Tosyn                         |
| `@tosynui/cli`         | `tosyn check`, `render`, `guide` and `css`                                    |

Every finding names the problem, where it is and how to fix it, so an AI model can correct its own
output in one round.

## Quick start

Use Node.js 24 LTS and pnpm 12.4.1.

```text
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

- **Playground** at http://localhost:5173: write markup, see the screen, the findings and the
  generated HTML; switch examples and themes; copy the AI guide.
- **Reference** at http://localhost:3000: every element, attribute and rule, generated from the
  catalog.

From the command line:

```text
node packages/cli/dist/bin.js check examples/*.tosyn
node packages/cli/dist/bin.js render examples/sign-in.tosyn --theme dark -o sign-in.html
node packages/cli/dist/bin.js guide -o tosyn-guide.md
```

## Testing with AI

[docs/testing-with-ai.md](docs/testing-with-ai.md) is a one-hour, no-code procedure for comparing
how Claude, Gemini, ChatGPT and others perform with Tosyn, with prompts and a score sheet.

## Quality

- Unit tests with coverage in every package; end-to-end tests for the playground.
- axe-core (WCAG 2.2 AA and best practices) on every example, in light and dark themes.
- Contrast tests for every text, border and focus colour pair in both themes.
- The AI guide and embedded stylesheet are generated, and tests fail if they are out of date.
- CI on Linux and Windows: formatting, lint (ESLint and Stylelint), types, unit and end-to-end
  tests.

## Commands

```text
pnpm dev            Start the playground and reference site
pnpm build          Build every package and app
pnpm lint           ESLint and Stylelint
pnpm typecheck      TypeScript in every workspace
pnpm test           Unit tests with coverage
pnpm test:e2e       Build, then run Playwright and axe-core tests
pnpm generate       Regenerate the embedded stylesheet and the AI guide
pnpm format         Format with Prettier
pnpm clean          Remove generated output only
```

## Workspace

| Directory    | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `packages/*` | The packages listed above.                               |
| `apps/*`     | Playground (Vite) and reference site (Next.js).          |
| `examples/`  | Example screens, used by tests, the playground and docs. |
| `docs/`      | Architecture decisions, AI guide and testing procedure.  |
| `tests/e2e`  | Playwright and axe-core tests.                           |

## Contributing

Language changes start in `packages/spec/src/catalog/elements.json`; design rules live in
`packages/rules/src/rules.ts`. After changing either, run `pnpm generate` so the AI guide stays in
step, and add or update an example in `examples/`.
