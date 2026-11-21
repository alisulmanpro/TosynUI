# @tosynui/mcp

An [MCP](https://modelcontextprotocol.io) server that lets AI tools such as Claude Code, Claude
Desktop and Cursor check and render Tosyn markup themselves.

> **Status: scaffold.** The server runs and has one starter tool, `say_hello`. The Tosyn tools are
> being built step by step; see [Build plan](#build-plan).

Built on the MCP TypeScript SDK v2 (`@modelcontextprotocol/server`).

## Files

| File                 | Purpose                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| `src/server.ts`      | `createServer()`: registers every tool, resource and prompt.                |
| `src/bin.ts`         | Starts the server on stdio. This is what an AI client runs.                 |
| `src/server.test.ts` | Connects a real MCP client in memory and calls the server like an AI would. |

Keeping `createServer()` separate from the transport means the tests exercise the real server
without starting a process.

## Run it

```text
pnpm --filter @tosynui/mcp build
pnpm --filter @tosynui/mcp inspect   # opens the MCP Inspector in the browser
pnpm --filter @tosynui/mcp test
```

In the Inspector, choose **Connect**, then **Tools → say_hello → Run**.

### Connect to Claude Code

From the repository root, after building:

```text
claude mcp add tosyn -- node "$(pwd)/packages/mcp/dist/bin.js"
```

Then ask Claude Code to use the `say_hello` tool. Remove it with `claude mcp remove tosyn`.

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
- [ ] Run `say_hello` in the Inspector and in Claude Code
- [ ] Practice: add an `add_numbers` tool with a test, then remove it

### Level 2: the real tools

- [ ] `check_markup`: takes `markup`, runs `parseMarkup` and `checkDocument`, attaches line and
      column, and returns every finding. Valid markup returns a short success message.
- [ ] `render_markup`: takes `markup` and an optional `theme`; returns the HTML page from
      `renderPage`, or the findings when the markup has errors.
- [ ] Return `structuredContent` with an `outputSchema`, so clients get data as well as text.
- [ ] Tests for valid, warning-only and invalid markup for both tools.
- [ ] Remove `say_hello`.

### Level 3: complete server

- [ ] Resource `tosyn://guide`: the AI guide from `renderGuide()`.
- [ ] Resource template `tosyn://examples/{name}`: the example screens.
- [ ] Prompt `design_screen`: takes a description and asks for one valid Tosyn screen.
- [ ] Publish the package with a `tosyn-mcp` binary, so anyone can run it with `npx`.
