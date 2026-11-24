import type { McpServer } from '@modelcontextprotocol/server';
import { attachLocations, parseMarkup } from '@tosynui/parser';
import { checkDocument } from '@tosynui/rules';
import type { Finding } from '@tosynui/rules';
import { z } from 'zod';

/** Parses and checks markup. Shared by every tool that needs to know if markup is valid. */
export function checkMarkup(markup: string): { valid: boolean; findings: Finding[] } {
  const parsed = parseMarkup(markup);

  // Step 1: syntax problems (unclosed tags, no <screen>) stop everything.
  if (!parsed.document || parsed.diagnostics.length > 0) {
    const findings: Finding[] = parsed.diagnostics.map((diagnostic) => ({
      source: 'spec',
      severity: 'error',
      ...diagnostic,
    }));
    return { valid: false, findings };
  }

  // Step 2: language + design rules, then add line and column to every finding.
  const result = checkDocument(parsed.document);
  return { valid: result.valid, findings: attachLocations(result.findings, parsed.locations) };
}

/** One finding as a line a model can act on: "3:5 error unknown-attribute: ..." */
function describe(finding: Finding): string {
  const where = finding.line ? `${finding.line}:${finding.column ?? 1}` : '-';
  return `${where} ${finding.severity} ${finding.code}: ${finding.message}`;
}

export function registerCheckMarkup(server: McpServer): void {
  server.registerTool(
    'check_markup',
    {
      title: 'Check Tosyn markup',
      description:
        'Checks a Tosyn screen against the language and the design rules. Returns every error and warning with its line, column and how to fix it. Call this after writing or changing Tosyn markup, and fix all errors before showing the markup to the user.',
      inputSchema: z.object({
        markup: z.string().describe('The full Tosyn markup, starting with <screen>.'),
      }),
      outputSchema: z.object({
        valid: z.boolean().describe('True when there are no errors. Warnings are allowed.'),
        errors: z.number(),
        warnings: z.number(),
        findings: z.array(
          z.object({
            severity: z.enum(['error', 'warning']),
            code: z.string(),
            message: z.string(),
            line: z.number().optional(),
            column: z.number().optional(),
          }),
        ),
      }),
    },
    async ({ markup }) => {
      const { valid, findings } = checkMarkup(markup);
      const errors = findings.filter((finding) => finding.severity === 'error').length;
      const warnings = findings.length - errors;

      const summary = valid
        ? `Valid Tosyn markup with ${warnings} warning(s).`
        : `Invalid Tosyn markup: ${errors} error(s), ${warnings} warning(s). Fix every error and check again.`;

      return {
        // For the model to read.
        content: [{ type: 'text', text: [summary, ...findings.map(describe)].join('\n') }],
        // For programs to use: must match outputSchema.
        structuredContent: {
          valid,
          errors,
          warnings,
          findings: findings.map(({ severity, code, message, line, column }) => ({
            severity,
            code,
            message,
            ...(line === undefined ? {} : { line }),
            ...(column === undefined ? {} : { column }),
          })),
        },
      };
    },
  );
}
