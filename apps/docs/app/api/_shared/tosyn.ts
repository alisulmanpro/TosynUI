import { attachLocations, parseMarkup } from '@tosynui/parser';
import { checkDocument } from '@tosynui/rules';
import type { Finding } from '@tosynui/rules';
import { catalog } from '@tosynui/spec';
import type { TosynDocument } from '@tosynui/spec';

/** One finding, as the API reports it. */
export interface ApiFinding {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  line?: number;
  column?: number;
}

/** The result of checking markup. Same shape as the `check_markup` tool of `@tosynui/mcp`. */
export interface CheckResult {
  specVersion: string;
  /** True when there are no errors. Warnings are allowed. */
  valid: boolean;
  errors: number;
  warnings: number;
  findings: ApiFinding[];
}

function toApiFinding({ severity, code, message, line, column }: Finding): ApiFinding {
  return {
    severity,
    code,
    message,
    ...(line === undefined ? {} : { line }),
    ...(column === undefined ? {} : { column }),
  };
}

/** Parses and checks markup. Also returns the document when it is valid, so it can be rendered. */
export function checkMarkup(markup: string): { result: CheckResult; document?: TosynDocument } {
  const parsed = parseMarkup(markup);

  // Syntax problems (unclosed tags, no <screen>) stop everything.
  let findings: Finding[];
  let valid: boolean;
  if (!parsed.document || parsed.diagnostics.length > 0) {
    findings = parsed.diagnostics.map((diagnostic) => ({
      source: 'spec',
      severity: 'error',
      ...diagnostic,
    }));
    valid = false;
  } else {
    const result = checkDocument(parsed.document);
    findings = attachLocations(result.findings, parsed.locations);
    valid = result.valid;
  }

  const errors = findings.filter((finding) => finding.severity === 'error').length;
  return {
    result: {
      specVersion: catalog.specVersion,
      valid,
      errors,
      warnings: findings.length - errors,
      findings: findings.map(toApiFinding),
    },
    ...(valid && parsed.document ? { document: parsed.document } : {}),
  };
}
