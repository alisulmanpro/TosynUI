import type { ElementNode } from '@tosynui/spec';
import type { Rule } from './types.js';

/** The deepest a section may be nested. Keeps derived heading levels within h1–h4. */
export const MAX_SECTION_DEPTH = 3;

/** The longest an action label may be, in words. */
export const MAX_ACTION_WORDS = 5;

function elements(node: ElementNode, name?: string): ElementNode[] {
  return (node.children ?? []).filter(
    (child): child is ElementNode => 'element' in child && (!name || child.element === name),
  );
}

function textOf(node: ElementNode): string {
  return (node.children ?? []).map((child) => ('text' in child ? child.text : '')).join('');
}

function attribute(node: ElementNode, name: string): string | boolean | undefined {
  return node.attributes?.[name];
}

/**
 * The design rules, in the order they run. Each rule is small, explains itself, and reports
 * a message that tells the author, human or model, exactly what to change.
 */
export const rules: readonly Rule[] = [
  {
    id: 'single-primary-action',
    severity: 'error',
    summary: 'Give each section at most one primary action.',
    rationale:
      'A primary action tells people what to do next. Two primary actions compete and make the choice harder.',
    check({ node, path }, report) {
      if (node.element !== 'section') return;
      const primary = elements(node, 'action').filter(
        (action) => attribute(action, 'importance') === 'primary',
      );
      if (primary.length > 1) {
        report(
          `Section "${String(attribute(node, 'name'))}" has ${primary.length} primary actions. Keep the main one as primary and make the others secondary or tertiary.`,
          path,
        );
      }
    },
  },
  {
    id: 'single-featured-section',
    severity: 'warning',
    summary: 'Feature at most one section per screen.',
    rationale:
      'Emphasis only works by contrast. When several sections are featured, none of them stands out.',
    check({ node, path }, report) {
      if (node.element !== 'screen') return;
      const featured: ElementNode[] = [];
      const collect = (parent: ElementNode): void => {
        for (const section of elements(parent, 'section')) {
          if (attribute(section, 'emphasis') === 'featured') featured.push(section);
          collect(section);
        }
      };
      collect(node);
      if (featured.length > 1) {
        report(
          `${featured.length} sections are featured. Feature only the most important one.`,
          path,
        );
      }
    },
  },
  {
    id: 'single-heading',
    severity: 'error',
    summary: 'Give each section at most one heading.',
    rationale:
      'A heading names its section. Split the section if it needs a second heading; heading levels come from nesting.',
    check({ node, path }, report) {
      if (node.element !== 'section') return;
      if (elements(node, 'heading').length > 1) {
        report(
          `Section "${String(attribute(node, 'name'))}" has more than one heading. Move the extra content into a nested <section> with its own heading.`,
          path,
        );
      }
    },
  },
  {
    id: 'heading-first',
    severity: 'warning',
    summary: "Put a section's heading before its other content.",
    rationale: 'People and screen readers use headings to understand a region before reading it.',
    check({ node, path }, report) {
      if (node.element !== 'section') return;
      const children = elements(node);
      const index = children.findIndex((child) => child.element === 'heading');
      if (index > 0) {
        report(
          `Move the <heading> of section "${String(attribute(node, 'name'))}" to the start of the section.`,
          path,
        );
      }
    },
  },
  {
    id: 'form-needs-heading',
    severity: 'warning',
    summary: 'Give every top-level section that contains fields a heading.',
    rationale:
      'A heading tells people what the form is for and gives assistive technology a name for the region.',
    check({ node, path, sectionDepth }, report) {
      if (node.element !== 'section' || sectionDepth !== 1) return;
      if (elements(node, 'field').length > 0 && elements(node, 'heading').length === 0) {
        report(
          `Section "${String(attribute(node, 'name'))}" contains fields but no heading. Add a <heading> that says what the form is for.`,
          path,
        );
      }
    },
  },
  {
    id: 'max-section-depth',
    severity: 'error',
    summary: `Nest sections at most ${MAX_SECTION_DEPTH} levels deep.`,
    rationale:
      'Deep nesting is hard to follow and pushes derived heading levels past what people can distinguish.',
    check({ node, path, sectionDepth }, report) {
      if (node.element === 'section' && sectionDepth === MAX_SECTION_DEPTH + 1) {
        report(
          `This section is nested ${sectionDepth} levels deep. Flatten the structure to at most ${MAX_SECTION_DEPTH} levels.`,
          path,
        );
      }
    },
  },
  {
    id: 'navigate-needs-target',
    severity: 'error',
    summary: 'Give every navigate action a target.',
    rationale: 'A navigation action without a destination cannot be rendered as a working link.',
    check({ node, path }, report) {
      if (
        node.element === 'action' &&
        attribute(node, 'intent') === 'navigate' &&
        !attribute(node, 'target')
      ) {
        report(
          `The "${textOf(node).trim()}" action navigates but has no target. Add target="/path".`,
          `${path}/attributes`,
        );
      }
    },
  },
  {
    id: 'target-requires-navigate',
    severity: 'warning',
    summary: 'Use target only on navigate actions.',
    rationale: 'Only navigation has a destination; on other intents the target is ignored.',
    check({ node, path }, report) {
      if (
        node.element === 'action' &&
        attribute(node, 'target') !== undefined &&
        attribute(node, 'intent') !== 'navigate'
      ) {
        report(
          `Remove target from the "${textOf(node).trim()}" action, or change its intent to navigate.`,
          `${path}/attributes/target`,
        );
      }
    },
  },
  {
    id: 'delete-not-primary',
    severity: 'warning',
    summary: 'Do not make delete actions primary.',
    rationale:
      'Destructive actions should take a deliberate choice, not be the most inviting option on screen.',
    check({ node, path }, report) {
      if (
        node.element === 'action' &&
        attribute(node, 'intent') === 'delete' &&
        attribute(node, 'importance') === 'primary'
      ) {
        report(
          `The "${textOf(node).trim()}" action deletes data. Make it secondary instead of primary.`,
          `${path}/attributes/importance`,
        );
      }
    },
  },
  {
    id: 'submit-needs-field',
    severity: 'warning',
    summary: 'Place submit actions in a section that has fields.',
    rationale:
      'A submit action sends the values of the fields around it. Without fields there is nothing to send.',
    check({ node, path, parent }, report) {
      if (node.element !== 'action' || attribute(node, 'intent') !== 'submit' || !parent) return;
      if (elements(parent.node, 'field').length === 0) {
        report(
          `The "${textOf(node).trim()}" action submits, but its section has no fields. Use intent="navigate" or move it next to the fields it submits.`,
          path,
        );
      }
    },
  },
  {
    id: 'concise-action-label',
    severity: 'warning',
    summary: `Keep action labels to ${MAX_ACTION_WORDS} words or fewer.`,
    rationale: 'Short labels are faster to scan and fit on small screens.',
    check({ node, path }, report) {
      if (node.element !== 'action') return;
      const words = textOf(node).trim().split(/\s+/).filter(Boolean);
      if (words.length > MAX_ACTION_WORDS) {
        report(
          `"${words.join(' ')}" is ${words.length} words long. Shorten it to ${MAX_ACTION_WORDS} words or fewer; put explanation in <text>.`,
          path,
        );
      }
    },
  },
];
