import type { ElementNode } from '@tosynui/spec';

export type Severity = 'error' | 'warning';

/** One problem reported by the spec validator or a design rule. */
export interface Finding {
  /** `spec` for language errors, `rules` for design rules. */
  source: 'spec' | 'rules';
  /** Diagnostic code for `spec` findings; rule id for `rules` findings. */
  code: string;
  severity: Severity;
  message: string;
  /** JSON Pointer to the element or attribute concerned. */
  path: string;
  line?: number;
  column?: number;
}

export interface CheckResult {
  /** True when there are no errors. Warnings do not make a document invalid. */
  valid: boolean;
  findings: Finding[];
}

/** An element in the document together with where it sits. */
export interface Visit {
  node: ElementNode;
  path: string;
  parent: Visit | undefined;
  /** Number of `section` elements enclosing this element, counting itself if it is a section. */
  sectionDepth: number;
}

export interface Rule {
  /** Stable kebab-case identifier, used as the finding code. */
  id: string;
  severity: Severity;
  /** The rule in one sentence, phrased as an instruction. */
  summary: string;
  /** Why the rule exists. */
  rationale: string;
  /** Inspects one element and reports problems through `report`. */
  check(visit: Visit, report: (message: string, path?: string) => void): void;
}
