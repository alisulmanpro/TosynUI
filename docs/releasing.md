# Releasing to npm

All packages in `packages/` are published under the `@tosynui` organisation on npm. The apps in
`apps/` are private and never published.

| Package                        | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `@tosynui/spec`                | Element catalog, schemas and validator |
| `@tosynui/parser`              | Markup parser                          |
| `@tosynui/rules`               | Design rules and `checkDocument`       |
| `@tosynui/tokens`              | Design tokens and CSS generation       |
| `@tosynui/render-html`         | HTML and CSS renderer                  |
| `@tosynui/render-react-native` | React Native renderer                  |
| `@tosynui/ai`                  | AI writing guide                       |
| `@tosynui/cli`                 | `tosyn` command                        |
| `@tosynui/mcp`                 | `tosyn-mcp` MCP server                 |

## One-time setup

1. An npm account with two-factor authentication turned on.
2. Membership of the `tosynui` organisation with permission to publish.
3. `npm login` on the machine that publishes. Never commit or share an npm token.

## Every release

1. **Start from a clean, up-to-date `main`.**

   ```text
   git checkout main
   git pull
   git status        # must say "nothing to commit"
   ```

2. **Set the version.** All packages share one version. For example, for `0.1.1`:

   ```text
   pnpm -r exec npm version 0.1.1 --no-git-tag-version
   ```

   Commit the change through a pull request, merge it, then pull `main` again.

3. **Build, test and publish.**

   ```text
   pnpm release
   ```

   This runs `pnpm build`, `pnpm test` and `pnpm -r publish`. pnpm publishes packages in
   dependency order, replaces `workspace:*` with real version numbers, and skips any version that
   is already on npm. npm asks for a one-time password from your authenticator.

4. **Tag the release.**

   ```text
   git tag v0.1.1
   git push origin v0.1.1
   ```

## Check a release

```text
npx @tosynui/cli --version
npx @tosynui/cli check examples/sign-in.tosyn
```

To add the MCP server to Claude Code from npm:

```text
claude mcp add tosyn -- npx -y @tosynui/mcp
```

## Before the first release

Check every package without publishing:

```text
pnpm build
pnpm -r exec pnpm pack --pack-destination ../../.packs
```

Each tarball should contain `dist/`, `README.md`, `LICENSE` and `package.json`, and
`workspace:*` should be replaced by the release version. Delete `.packs/` afterwards.
