# @tosynui/ai

AI tooling for Tosyn.

`renderGuide()` generates instructions that teach a model to write Tosyn markup. It is built from
the element catalog and the design rules, so it always matches what the checker accepts. The
committed copy is [`docs/ai/tosyn-guide.md`](../../docs/ai/tosyn-guide.md); regenerate it with
`pnpm generate` at the repository root.

Planned: an MCP server that lets AI tools check and render Tosyn directly.
