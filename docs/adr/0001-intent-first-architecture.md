# ADR 0001: Intent-first architecture

- **Status:** Accepted
- **Date:** 2026-11-13
- **Amended by:** [ADR 0002](0002-parser-and-token-pipeline.md) (parser and token pipeline)

## Context

The repository started as the foundation for a class-based CSS library for AI generation: short
semantic classes such as `btn` on top of shared design tokens.

Research in November 2026 found that this position is already occupied. daisyUI ships short
semantic classes, an llms.txt and an MCP server; Basecoat offers the same classes without React;
and at least two projects pitch an almost identical "semantic CSS for agents" library. AI tools
default to Tailwind CSS and shadcn/ui, and new libraries are not chosen by models unless their
documentation is supplied in context.

The same research pointed to problems that remain open:

- **Drift.** Generated screens diverge in spacing, colour and hierarchy, and models bypass tokens
  even when they exist.
- **No enforcement.** Design rules are written as prose (for example DESIGN.md files); nothing
  checks generated output against them.
- **Accessibility.** Models handle simple cases (contrast, alt text) better than complex ones (ARIA,
  labels, structure); validation in the loop improves results.
- **Platform lock-in.** Class names only work on the web, so a theme cannot follow a product from
  web to mobile and desktop.

All four share a cause: visual decisions are made inside markup, by whoever writes the markup.

## Decision

Tosyn is an **intent language**, not a CSS library. Documents describe purpose, structure and
importance; they contain no visual values.

1. **Authoring form.** People and models write HTML-like markup (`<action importance="primary">`).
   Models write HTML fluently and people can read it without tooling.
2. **Intermediate representation.** A parser converts markup to a JSON tree. Validation, design
   rules and renderers operate on this tree only, which keeps them independent of the authoring
   form and of any output platform.
3. **Element catalog as the single source of truth.** One JSON file defines every element,
   attribute, allowed value, content model and nesting rule. The validator, the reference site and
   future AI tooling read the same file.
4. **Two levels of checking.** The spec validator answers "is this valid Tosyn?". A separate rules
   package will answer "is this good design?" (for example one primary action per section,
   contrast thresholds, heading order).
5. **Derived, not chosen.** Values that can be computed are not authored. Heading levels come from
   section depth; visual style comes from tokens and rules.
6. **Diagnostics written for correction.** Every diagnostic carries a stable code, a JSON Pointer
   and a message that states the fix, so a model can repair its own output.
7. **Standards over inventions.** Design tokens will use the W3C DTCG 2025.10 format. Tosyn should
   interoperate with DESIGN.md, MCP and agent instruction files rather than replace them.

## Technology

| Concern       | Choice                                             |
| ------------- | -------------------------------------------------- |
| Language      | TypeScript, ES modules                             |
| Workspace     | pnpm workspaces and Turborepo                      |
| Schemas       | JSON Schema 2020-12, validated with Ajv            |
| Markup parser | parse5 (planned)                                   |
| Tokens        | W3C DTCG 2025.10 with Style Dictionary (planned)   |
| Web renderer  | Plain HTML and CSS with cascade layers (planned)   |
| AI tooling    | MCP TypeScript SDK and AGENTS.md (planned)         |
| Testing       | Vitest, Playwright and axe-core (planned for a11y) |

## Consequences

- The setup demonstration packages (`core`, `build`, `contracts`) and the React fixture are
  removed. `@tosynui/spec` replaces `@tosynui/contracts`.
- Visual control moves from the author to tokens and rules. Some designs will need an explicit
  escape hatch; it will be designed when a real case requires it rather than in advance.
- The value of the approach is unproven. The first milestone after the renderer is a benchmark
  comparing Tosyn with Tailwind CSS, shadcn/ui and daisyUI on consistency across screens, invalid
  output, accessibility violations and tokens used. The project's claims will be limited to what
  that benchmark shows.
