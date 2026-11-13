# Tosyn

Tosyn is an intent language for user interfaces, designed to be written by AI models and read by
people.

A Tosyn document describes what each part of a screen does and how important it is. It never
describes how it looks. Design rules and renderers turn the same document into a consistent result,
so visual decisions live in one place instead of being re-made, and drifting, on every screen.

```html
<screen name="bmi-calculator" purpose="Work out body mass index from height and weight.">
  <section name="inputs" emphasis="featured">
    <heading>BMI calculator</heading>
    <field name="height" label="Height" kind="number" unit="cm" required></field>
    <field name="weight" label="Weight" kind="number" unit="kg" required></field>
    <action intent="submit" importance="primary">Calculate BMI</action>
  </section>
</screen>
```

> **Status: early design (v0.1).** The element catalog and validator exist. The markup parser,
> design rules, renderers and AI integrations described below are planned and not yet built. The
> markup above shows the intended authoring form; today documents are written in the JSON
> intermediate representation. See [ADR 0001](docs/adr/0001-intent-first-architecture.md) for the
> design and the reasoning behind it.

## How it fits together

| Layer        | Role                                                                 | Status  |
| ------------ | -------------------------------------------------------------------- | ------- |
| Spec         | Element catalog, document schema and validator (`@tosynui/spec`)     | v0.1    |
| Parser       | Tosyn markup → JSON intermediate representation (IR)                 | Planned |
| Design rules | Machine-checkable rules for good design ("one primary action", etc.) | Planned |
| Tokens       | Design values in the W3C DTCG format, exported per platform          | Planned |
| Renderers    | IR → HTML and CSS first; native platforms later                      | Planned |
| AI tooling   | MCP server and agent instructions so AI tools can use the spec       | Planned |

Every diagnostic the validator produces names the problem, where it is and how to fix it, so an AI
model can correct its own output.

## Quick start

Use Node.js 24 LTS and pnpm 12.4.1.

```text
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

- Playground (validate a document as you type): http://localhost:5173
- Reference documentation (generated from the catalog): http://localhost:3000

## Commands

```text
pnpm dev            Start the playground and documentation site
pnpm build          Build every package and app
pnpm lint           ESLint and Stylelint
pnpm typecheck      TypeScript in every workspace
pnpm test           Unit tests with coverage and package export checks
pnpm test:e2e       Build, then run Playwright end-to-end tests
pnpm format         Format with Prettier
pnpm clean          Remove generated output only
```

## Workspace

| Directory         | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `packages/spec`   | The intent language: catalog, JSON Schemas, validator and examples. |
| `apps/playground` | Vite app that validates a document live and shows each diagnostic.  |
| `apps/docs`       | Next.js reference site generated from the same catalog.             |
| `docs/adr`        | Architecture decision records.                                      |
| `tests/e2e`       | Playwright tests for the apps.                                      |

## Contributing

Changes to the language start in `packages/spec/src/catalog/elements.json`. Keep the catalog, the
schemas, the tests and the reference site in agreement; CI checks formatting, lint, types, unit
tests and end-to-end tests on Linux and Windows.
