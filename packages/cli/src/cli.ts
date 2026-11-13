import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { renderGuide } from '@tosynui/ai';
import { attachLocations, parseMarkup } from '@tosynui/parser';
import { renderPage, stylesheet } from '@tosynui/render-html';
import type { Theme } from '@tosynui/render-html';
import { checkDocument } from '@tosynui/rules';
import type { Finding } from '@tosynui/rules';
import type { TosynDocument } from '@tosynui/spec';

export const USAGE = `Usage: tosyn <command> [options]

Commands:
  check <files...>      Check Tosyn markup against the language and design rules
  render <file>         Render a screen as a standalone HTML page
  guide                 Print instructions that teach an AI model to write Tosyn
  css                   Print the stylesheet (theme variables and components)

Options:
  -o, --output <file>   Write to a file instead of standard output (render, guide, css)
      --theme <theme>   light, dark or system (render; default system)
      --format <format> text or json (check; default text)
  -h, --help            Show this help
  -v, --version         Show the version
`;

export const VERSION = '0.1.0';

/** Where output goes. Injected so the CLI can be tested without a terminal. */
export interface Io {
  stdout(text: string): void;
  stderr(text: string): void;
  readFile(path: string): Promise<string>;
  writeFile(path: string, text: string): Promise<void>;
}

export const nodeIo: Io = {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
  readFile: (path) => readFile(path, 'utf8'),
  writeFile: (path, text) => writeFile(path, text, 'utf8'),
};

interface FileReport {
  file: string;
  valid: boolean;
  findings: Finding[];
}

/** Parses and checks one file of markup. Parse errors are reported as spec errors. */
export function checkMarkup(source: string): {
  document: TosynDocument | undefined;
  valid: boolean;
  findings: Finding[];
} {
  const parsed = parseMarkup(source);
  const parseFindings: Finding[] = parsed.diagnostics.map((diagnostic) => ({
    source: 'spec',
    severity: 'error',
    ...diagnostic,
  }));
  if (!parsed.document || parseFindings.length > 0) {
    return { document: parsed.document, valid: false, findings: parseFindings };
  }
  const result = checkDocument(parsed.document);
  return {
    document: parsed.document,
    valid: result.valid,
    findings: attachLocations(result.findings, parsed.locations),
  };
}

function formatFinding(file: string, finding: Finding): string {
  const position = finding.line ? `:${finding.line}:${finding.column ?? 1}` : '';
  return `${file}${position}  ${finding.severity.padEnd(7)}  ${finding.code}  ${finding.message}`;
}

/** Runs the CLI and returns the process exit code. */
export async function run(argv: string[], io: Io = nodeIo): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        output: { type: 'string', short: 'o' },
        theme: { type: 'string' },
        format: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (error) {
    io.stderr(`${(error as Error).message}\n\n${USAGE}`);
    return 2;
  }

  const { values, positionals } = parsed;
  const [command, ...files] = positionals;

  if (values.version) {
    io.stdout(`${VERSION}\n`);
    return 0;
  }
  if (values.help || !command) {
    (values.help ? io.stdout : io.stderr)(USAGE);
    return values.help ? 0 : 2;
  }

  const output = async (text: string): Promise<void> => {
    if (values.output) await io.writeFile(values.output, text);
    else io.stdout(text);
  };

  const fail = (message: string): number => {
    io.stderr(`tosyn: ${message}\n`);
    return 2;
  };

  switch (command) {
    case 'check': {
      if (files.length === 0) return fail('check needs at least one file.');
      const format = values.format ?? 'text';
      if (format !== 'text' && format !== 'json') return fail('--format must be text or json.');

      const reports: FileReport[] = [];
      for (const file of files) {
        let source: string;
        try {
          source = await io.readFile(file);
        } catch {
          return fail(`cannot read ${file}.`);
        }
        const { valid, findings } = checkMarkup(source);
        reports.push({ file, valid, findings });
      }

      if (format === 'json') {
        io.stdout(`${JSON.stringify(reports, null, 2)}\n`);
      } else {
        for (const report of reports) {
          for (const finding of report.findings)
            io.stdout(`${formatFinding(report.file, finding)}\n`);
        }
        const errors = reports
          .flatMap((r) => r.findings)
          .filter((f) => f.severity === 'error').length;
        const warnings = reports.flatMap((r) => r.findings).length - errors;
        io.stdout(
          `${reports.length} file${reports.length === 1 ? '' : 's'} checked: ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}.\n`,
        );
      }
      return reports.every((report) => report.valid) ? 0 : 1;
    }

    case 'render': {
      const [file] = files;
      if (!file || files.length > 1) return fail('render needs exactly one file.');
      const theme = values.theme ?? 'system';
      if (!['light', 'dark', 'system'].includes(theme)) {
        return fail('--theme must be light, dark or system.');
      }
      let source: string;
      try {
        source = await io.readFile(file);
      } catch {
        return fail(`cannot read ${file}.`);
      }
      const { document, valid, findings } = checkMarkup(source);
      for (const finding of findings) io.stderr(`${formatFinding(file, finding)}\n`);
      if (!document || !valid) return fail(`${file} has errors; fix them before rendering.`);
      await output(renderPage(document, { theme: theme as Theme }));
      return 0;
    }

    case 'guide':
      await output(renderGuide());
      return 0;

    case 'css':
      await output(stylesheet());
      return 0;

    default:
      return fail(`unknown command "${command}".\n\n${USAGE}`);
  }
}
