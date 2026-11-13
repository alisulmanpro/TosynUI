# @tosynui/cli

Command-line tool for Tosyn.

```text
tosyn check <files...>            Check markup against the language and design rules
tosyn render <file> [-o out.html] [--theme light|dark|system]
tosyn guide [-o file]             Print the AI guide
tosyn css [-o file]               Print the stylesheet
```

`check` prints one line per finding with the file, line and column, and exits with `1` when any
file has an error. Use `--format json` for machine-readable output.

Inside this repository, run it with `node packages/cli/dist/bin.js` after `pnpm build`.
