# TosynUI

TosynUI is being developed as a class-based CSS library designed for AI generation and human understanding.
This repository currently contains only the development foundation and setup demonstrations. It does not yet
implement the product roadmap.

## Quick start

Use Node.js 24 LTS and pnpm 12.4.1.

```text
pnpm install --frozen-lockfile
pnpm dev
```

The development servers are available at:

- Playground: http://localhost:5173
- React fixture: http://localhost:5174
- Documentation: http://localhost:3000

## Commands

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
pnpm test
pnpm test:e2e
pnpm clean
```

`pnpm clean` removes generated output only. It does not remove source files or the lockfile.

## Toolchain

| Tool              | Version                              |
| ----------------- | ------------------------------------ |
| Node.js           | 24 LTS (24.19.0 verified on Windows) |
| pnpm              | 12.4.1                               |
| Turborepo         | 2.10.13                              |
| TypeScript        | 5.9.3                                |
| Vite              | 8.3.0                                |
| Next.js           | 16.3.5                               |
| React / React DOM | 19.3.0                               |
| PostCSS           | 8.5.28                               |
| Ajv               | 8.20.0                               |
| ESLint            | 10.10.0                              |
| Stylelint         | 17.15.0                              |
| Prettier          | 3.9.6                                |
| Vitest            | 5.0.0                                |
| Playwright Test   | 1.63.0                               |

## Workspace map

| Directory            | Purpose                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/core`      | CSS source, initial custom-property tokens, scoped setup demonstration, and stylesheet exports. |
| `packages/contracts` | JSON Schema, Ajv validation, and TypeScript contract types.                                     |
| `packages/build`     | Deterministic PostCSS assembly, token CSS generation, contract validation, and watch mode.      |
| `apps/playground`    | Plain HTML and TypeScript Vite consumer of the public core CSS export.                          |
| `apps/react-fixture` | Minimal React and TypeScript Vite consumer of the same CSS export.                              |
| `apps/docs`          | Small Next.js documentation site for setup guidance and public export examples.                 |

The repository intentionally does not contain Studio, MCP, the AI checker, native applications, or future services.

## Where to begin

- Write CSS in `packages/core/src/index.css`, `base.css`, and `setup-demo.css`.
- Add or revise initial values in `packages/core/src/tokens.json`.
- Add contract schemas and TypeScript validation exports in `packages/contracts/src`.
- Keep setup demonstration content clearly separate from future production component work.

The core package is React-free. Consumers must import `@tosynui/core/styles.css` through its public package export;
the fixtures are intentionally small so package resolution and browser rendering remain easy to inspect.
