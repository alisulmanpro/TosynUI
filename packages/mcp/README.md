# @tosynui/mcp

An [MCP](https://modelcontextprotocol.io) server that lets AI tools such as Claude Code, Claude
Desktop and Cursor check and render Tosyn markup themselves.

> **Status: complete for v0.1.** Two tools, the guide and examples as resources, and a prompt.
> Publishing to npm is the last step; see [Build plan](#build-plan).

## What it offers

| Kind     | Name                      | What it does                                                       |
| -------- | ------------------------- | ------------------------------------------------------------------ |
| Tool     | `check_markup`            | Checks markup; returns every error and warning with line and fix.  |
| Tool     | `render_markup`           | Renders valid markup as a full HTML page in light, dark or system. |
| Resource | `tosyn://guide`           | The AI writing guide: every element, attribute and design rule.    |
| Resource | `tosyn://examples/{name}` | Example screens: `bmi-calculator`, `sign-in`, `account-settings`.  |
| Prompt   | `design_screen`           | Designs a screen from a description, then checks and fixes it.     |

Built on the MCP TypeScript SDK v2 (`@modelcontextprotocol/server`).

## Files

| File                  | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `src/server.ts`       | `createServer()`: registers every tool, resource and prompt.     |
| `src/bin.ts`          | Starts the server on stdio. This is what an AI client runs.      |
| `src/tools/*.ts`      | One file per tool, each with its own test.                       |
| `src/test/connect.ts` | Connects a real MCP client in memory, as Claude or Cursor would. |

Keeping `createServer()` separate from the transport means the tests exercise the real server
without starting a process.

## Run it

```text
pnpm --filter @tosynui/mcp build
pnpm --filter @tosynui/mcp inspect   # opens the MCP Inspector in the browser
pnpm --filter @tosynui/mcp test
```

In the Inspector, turn on the server's toggle, open **Tools**, pick a tool, fill in `markup` and
choose **Execute Tool**.

### Connect to Claude Code

From npm:

```text
claude mcp add tosyn -- npx -y @tosynui/mcp
```

From this repository root, after building:

```text
claude mcp add tosyn -- node "$(pwd)/packages/mcp/dist/bin.js"
```

Then, in Claude Code, run the `design_screen` prompt (type `/` to find it) or ask: _"Read the
Tosyn guide and design a contact page, checking it with check_markup."_ Remove it with `claude mcp remove tosyn`.

### Rules for stdio servers

- **Never write to stdout** with `console.log`: stdout carries MCP messages, and stray text breaks
  the connection. Use `console.error` for logs.
- **The description is the interface.** Models decide when to call a tool from its `description`
  and its input descriptions alone, so write them for a reader who has never seen the code.
- **Return errors as results.** A tool that fails should return `isError: true` with a message
  the model can act on, rather than throwing.

## Build plan

### Level 1: basics

- [x] Server with one tool, connected over stdio
- [x] In-memory test with a real MCP client
- [x] Run `say_hello` in the Inspector and in Claude Code
- [ ] Practice: add an `add_numbers` tool with a test, then remove it

### Level 2: the real tools

- [x] `check_markup`: takes `markup`, runs `parseMarkup` and `checkDocument`, attaches line and
      column, and returns every finding. Valid markup returns a short success message.
- [x] `render_markup`: takes `markup` and an optional `theme`; returns the HTML page from
      `renderPage`, or the findings when the markup has errors.
- [x] Return `structuredContent` with an `outputSchema`, so clients get data as well as text.
- [x] Tests for valid, warning-only and invalid markup for both tools.
- [x] Remove `say_hello`.

### Level 3: complete server

- [x] Resource `tosyn://guide`: the AI guide from `renderGuide()`.
- [x] Resource template `tosyn://examples/{name}`: the example screens.
- [x] Prompt `design_screen`: takes a description and asks for one valid Tosyn screen.
- [x] Prepare the package for npm with a `tosyn-mcp` binary ([releasing](../../docs/releasing.md)).

`src/examples.generated.ts` embeds `examples/*.tosyn` so the published package needs no files from
the repository. `pnpm build` regenerates it, and a test fails if it is out of date.
