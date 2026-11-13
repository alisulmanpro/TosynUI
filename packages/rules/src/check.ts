import { validateDocument } from '@tosynui/spec';
import type { ElementNode, TosynDocument } from '@tosynui/spec';
import { rules as defaultRules } from './rules.js';
import type { CheckResult, Finding, Rule, Visit } from './types.js';

export interface CheckOptions {
  /** Rules to run. Defaults to every built-in rule. */
  rules?: readonly Rule[];
}

/**
 * Checks a document in two stages: the spec validator, then the design rules.
 *
 * Design rules assume a valid document, so they run only when validation passes. The result is
 * valid when no finding has `error` severity.
 */
export function checkDocument(value: unknown, options: CheckOptions = {}): CheckResult {
  const validation = validateDocument(value);
  if (!validation.valid) {
    const findings: Finding[] = validation.diagnostics.map((diagnostic) => ({
      source: 'spec',
      severity: 'error',
      ...diagnostic,
    }));
    return { valid: false, findings };
  }

  const findings = runRules((value as TosynDocument).root, options.rules ?? defaultRules);
  return { valid: findings.every((finding) => finding.severity !== 'error'), findings };
}

function runRules(root: ElementNode, rules: readonly Rule[]): Finding[] {
  const findings: Finding[] = [];
  const visits: Visit[] = [];

  const walk = (node: ElementNode, path: string, parent: Visit | undefined): void => {
    const sectionDepth = (parent?.sectionDepth ?? 0) + (node.element === 'section' ? 1 : 0);
    const visit: Visit = { node, path, parent, sectionDepth };
    visits.push(visit);
    (node.children ?? []).forEach((child, index) => {
      if ('element' in child) walk(child, `${path}/children/${index}`, visit);
    });
  };
  walk(root, '/root', undefined);

  for (const rule of rules) {
    for (const visit of visits) {
      rule.check(visit, (message, path = visit.path) => {
        findings.push({ source: 'rules', code: rule.id, severity: rule.severity, message, path });
      });
    }
  }
  return findings;
}
